import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Mic, Square, CheckCircle } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (base64: string | null) => void;
  maxDurationMs?: number;
  audioUrl?: string | null;
}

const MAX_DURATION = 120000; // 2 minutes

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, maxDurationMs = MAX_DURATION, audioUrl }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(maxDurationMs / 1000);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (audioUrl) {
      setPreviewUrl(audioUrl);
      setRecordingFinished(true);
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  const startVisualization = (stream: MediaStream) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim();

    const draw = () => {
      if (!canvas || !ctx || !analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = `hsl(${primary} / 0.9)`;
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      if (isRecording) requestAnimationFrame(draw);
    };

    draw();
  };

  const start = async () => {
    if (isRecording || recordingFinished) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        setIsRecording(false);
        setRecordingFinished(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        const reader = new FileReader();
        reader.onloadend = () => onAudioReady(typeof reader.result === 'string' ? reader.result : null);
        reader.readAsDataURL(blob);
        // cleanup
        stream.getTracks().forEach((t) => t.stop());
        audioCtxRef.current?.close();
      };

      startVisualization(stream);
      mr.start();
      setIsRecording(true);
      setTimeLeft(maxDurationMs / 1000);

      timerRef.current = window.setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            stop();
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      // Safety stop
      window.setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') stop();
      }, maxDurationMs);
    } catch (e) {
      console.error('Mic access error', e);
      onAudioReady(null);
    }
  };

  const stop = () => {
    if (!isRecording) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const reset = () => {
    setPreviewUrl(null);
    onAudioReady(null);
    setRecordingFinished(false);
    setIsRecording(false);
  };

  const getButtonProps = () => {
    if (isRecording) {
      return {
        variant: 'destructive' as const,
        onClick: stop,
        'aria-label': 'Parar gravação',
        children: <>
          <Square className="w-5 h-5 mr-2" />
          Parar
        </>,
      };
    }
    if (recordingFinished) {
      return {
        variant: 'secondary' as const,
        onClick: () => {},
        'aria-label': 'Gravação finalizada',
        disabled: true,
        children: <>
          <CheckCircle className="w-5 h-5 mr-2" />
          Já está
        </>,
      };
    }
    return {
      variant: 'default' as const,
      onClick: start,
      'aria-label': 'Iniciar gravação',
      children: <>
        <Mic className="w-5 h-5 mr-2" />
        Gravar áudio
      </>,
    };
  };


  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-3">
        <Button {...getButtonProps()} size="lg" />
        <span className="text-sm text-muted-foreground">{isRecording ? `Tempo restante: ${timeLeft}s` : 'Máx. 2 min'}</span>
        {previewUrl && !isRecording && (
          <Button onClick={reset} variant="link" className="text-sm">Regravar</Button>
        )}
      </div>
      <div className="bg-card rounded-md border p-3">
        <canvas ref={canvasRef} width={600} height={80} className="w-full h-20" />
      </div>
      {previewUrl && (
        <audio src={previewUrl} controls className="w-full" />)
      }
    </div>
  );
};
