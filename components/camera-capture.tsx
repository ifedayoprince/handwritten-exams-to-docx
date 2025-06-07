"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Loader2, GripVertical, X, Edit2, Camera, FolderOpen, Check, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ImageGallery } from "./image-gallery"
import { cn } from "@/lib/utils"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void
  images: { id: string; dataUrl: string }[]
  onRemove: (id: string) => void
  onReorder: (reorderedImages: { id: string; dataUrl: string }[]) => void
  onDone: (documentName: string, images: { id: string; dataUrl: string }[]) => void
  isProcessing?: boolean
}

const DraggableImage = ({ image, index, onRemove, onReorder, moveImage }: {
  image: { id: string; dataUrl: string }
  index: number
  onRemove: (id: string) => void
  onReorder: (reorderedImages: { id: string; dataUrl: string }[]) => void
  moveImage: (fromIndex: number, toIndex: number) => { id: string; dataUrl: string }[]
}) => {
  const dragDropRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: { id: image.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "image",
    hover(item: { id: string; index: number }, monitor) {
      if (!monitor.isOver({ shallow: true })) return
      if (item.index === index) return

      const hoverBoundingRect = dragDropRef.current?.getBoundingClientRect()
      if (!hoverBoundingRect) return

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      if (item.index < index && hoverClientY < hoverMiddleY) return
      if (item.index > index && hoverClientY > hoverMiddleY) return

      onReorder(moveImage(item.index, index))
      item.index = index
    },
  })

  drag(dragDropRef)
  drop(dragDropRef)

  return (
    <div
      ref={dragDropRef}
      className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden group"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img src={image.dataUrl} alt="Captured" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 rounded-full z-20"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
        >
          <X className="h-4 w-4 text-white" />
        </button>
        <div className="absolute inset-0 flex items-center justify-center cursor-move z-10">
          <GripVertical className="h-6 w-6 text-white/80" />
        </div>
      </div>
    </div>
  )
}

export const CameraCapture = forwardRef<{ captureImage: () => string | null }, CameraCaptureProps>(
  ({ onCapture, images, onRemove, onReorder, onDone, isProcessing = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [flashlightOn, setFlashlightOn] = useState(false)
    const [isCapturing, setIsCapturing] = useState(false)
    const [documentName, setDocumentName] = useState("Untitled Document")
    const [isEditingName, setIsEditingName] = useState(false)
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
    const [selectedCamera, setSelectedCamera] = useState<string>("")
    const [processingQueue, setProcessingQueue] = useState<Array<{
      documentName: string;
      images: { id: string; dataUrl: string }[];
    }>>([])
    const [isProcessingQueue, setIsProcessingQueue] = useState(false)
    const { toast } = useToast()
    const isMobile = useMobile()

    // Function to get available cameras
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setAvailableCameras(videoDevices)

        // Set default camera if none selected
        if (!selectedCamera && videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId)
        }
      } catch (err) {
        console.error("Error getting cameras:", err)
        toast({
          title: "Camera Error",
          description: "Could not get list of cameras",
          variant: "destructive",
        })
      }
    }

    // Start camera with selected device
    const startCamera = async () => {
      if (!selectedCamera) return

      try {
        setIsLoading(true)
        setError(null)

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: selectedCamera },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Could not access camera. Please ensure you have granted camera permissions.")
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please check permissions.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Handle camera change
    const handleCameraChange = (deviceId: string) => {
      setSelectedCamera(deviceId)
    }

    // Get cameras on mount and when permissions change
    useEffect(() => {
      getAvailableCameras()

      // Listen for device changes
      navigator.mediaDevices.addEventListener('devicechange', getAvailableCameras)

      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', getAvailableCameras)
      }
    }, [])

    // Start camera when selection changes
    useEffect(() => {
      if (selectedCamera) {
        startCamera()
      }
    }, [selectedCamera])

    const handleCapture = () => {
      if (!captureRef.current || isEditingName) return

      setIsCapturing(true)
      const dataUrl = captureRef.current.captureImage()
      if (dataUrl) {
        onCapture(dataUrl)
        toast({
          title: "Image Captured",
          description: "Added to gallery",
          duration: 1500,
        })
      }
      setTimeout(() => setIsCapturing(false), 150)
    }

    const handleDone = () => {
      if (images.length === 0) return;

      const currentImages = [...images];
      const currentName = documentName;

      // Add current document to queue
      setProcessingQueue(prev => [...prev, {
        documentName: currentName,
        images: currentImages
      }]);

      // Reset the current state
      currentImages.forEach(img => onRemove(img.id));
      setDocumentName("Untitled Document");
      setIsEditingName(false);

      toast({
        title: "Added to Queue",
        description: `"${currentName}" added to processing queue`,
        duration: 2000,
      });
    }

    // Process queue in background
    useEffect(() => {
      const processQueue = async () => {
        if (isProcessingQueue || processingQueue.length === 0) return;

        setIsProcessingQueue(true);
        const nextItem = processingQueue[0];

        try {
          await onDone(nextItem.documentName, nextItem.images);
          console.log("Done processing document")
          setProcessingQueue(prev => prev.slice(1));
          setIsProcessingQueue(false);
          toast({
            title: "Document Processed",
            description: `Successfully processed "${nextItem.documentName}"`,
            duration: 3000,
          });
        } catch (error) {
          setProcessingQueue(prev => prev.slice(1));
          setIsProcessingQueue(false);
          toast({
            title: "Processing Failed",
            description: `Failed to process "${nextItem.documentName}". Please try again.`,
            variant: "destructive",
            duration: 5000,
          });
        }

        // Process next item in queue if any
        if (processingQueue.length > 1) {
          setTimeout(() => {
            processQueue();
          }, 1000); // Wait 1 second before processing next item
        }
      };

      processQueue();
    }, [processingQueue, isProcessingQueue, onDone, toast]);

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        // Only prevent capture when editing document name to avoid typing issues
        if (isEditingName) return

        if (e.code === 'Space') {
          e.preventDefault()
          handleCapture()
        }
      }

      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }, [isEditingName])

    const captureRef = useRef<{ captureImage: () => string | null }>({
      captureImage: () => {
        if (!videoRef.current || !canvasRef.current) return null

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (!context) return null

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL("image/jpeg", 0.8)
      },
    })

    useImperativeHandle(ref, () => captureRef.current)

    const moveImage = (fromIndex: number, toIndex: number) => {
      const items = Array.from(images)
      const [movedItem] = items.splice(fromIndex, 1)
      items.splice(toIndex, 0, movedItem)
      return items
    }

    return (
      <div className="flex h-screen overflow-hidden bg-black">
        {/* Left Panel - Scrollable Content */}
        <div className="w-1/3 min-w-[320px] border-r border-white/10 flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    autoFocus
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => {
                      e.stopPropagation() // Prevent space from triggering capture
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        e.preventDefault()
                        setIsEditingName(false)
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(false)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-white/90 text-xl font-semibold">{documentName}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-white/60" />
                  </button>
                </div>
              )}
              <span className="text-white/40 text-sm">{images.length} images</span>
            </div>
          </div>

          {/* Camera Selection */}
          <div className="px-6 py-4 border-b border-white/10">
            <Select
              value={selectedCamera}
              onValueChange={handleCameraChange}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {availableCameras.map((camera) => (
                  <SelectItem
                    key={camera.deviceId}
                    value={camera.deviceId}
                    className="text-white hover:bg-white/10"
                  >
                    {camera.label || `Camera ${camera.deviceId.slice(0, 5)}...`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Queue Status */}
          {processingQueue.length > 0 && (
            <div className="px-6 py-2 border-b border-white/10 bg-white/5">
              <p className="text-white/60 text-sm">
                {isProcessingQueue ? (
                  <span className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Processing {processingQueue[0].documentName}
                  </span>
                ) : (
                  `Queue: ${processingQueue.length} document${processingQueue.length === 1 ? '' : 's'}`
                )}
              </p>
            </div>
          )}

          {/* Scrollable Image Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <DndProvider backend={HTML5Backend}>
              <div className="grid grid-cols-2 gap-4 auto-rows-max">
                {images.map((image, index) => (
                  <DraggableImage
                    key={image.id}
                    image={image}
                    index={index}
                    onRemove={onRemove}
                    onReorder={onReorder}
                    moveImage={moveImage}
                  />
                ))}
              </div>
            </DndProvider>
          </div>

          {/* Fixed Bottom Controls */}
          <div className="p-6 border-t border-white/10">
            <p className="text-white/60 text-sm mb-4">
              Press <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd> to capture
            </p>
            <Button
              className="w-full bg-white text-black hover:bg-white/90 transition-all duration-200"
              onClick={handleDone}
              disabled={images.length === 0}
            >
              <Check className="mr-2 h-4 w-4" />
              Done ({images.length} images)
            </Button>
          </div>
        </div>

        {/* Right Panel - Camera View */}
        <div className="flex-1 relative flex items-center justify-center p-4">
          <div className={cn(
            "relative aspect-square w-full max-w-[80vh] transition-all duration-150",
            isCapturing && "brightness-200"
          )}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-white/90">Accessing camera...</span>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background p-4 z-10 rounded-xl">
                <div className="text-center">
                  <p className="text-destructive mb-2">{error}</p>
                  <p className="text-sm text-white/60">
                    Please check your browser settings and ensure camera permissions are enabled.
                  </p>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover rounded-xl border-4 border-gray-800"
              onCanPlay={() => setIsLoading(false)}
            />

            <canvas ref={canvasRef} className="hidden" />

            {/* Floating Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full",
                  flashlightOn ? "bg-yellow-500 hover:bg-yellow-600" : "bg-zinc-800/50 hover:bg-zinc-700/50",
                  "border-2 border-white/20 hover:border-white/30",
                  "backdrop-blur-sm"
                )}
                onClick={() => setFlashlightOn(!flashlightOn)}
              >
                <Lightbulb className={cn("h-5 w-5", flashlightOn ? "text-white" : "text-zinc-300")} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-16 w-16 rounded-full bg-white/10 hover:bg-white/20",
                  "border-2 border-white/20 hover:border-white/30",
                  "backdrop-blur-sm"
                )}
                onClick={handleCapture}
              >
                <Camera className="h-8 w-8 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

CameraCapture.displayName = "CameraCapture"

