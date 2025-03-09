"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CameraPermissionProps {
    onGranted: () => void
}

export function CameraPermission({ onGranted }: CameraPermissionProps) {
    const [isRequesting, setIsRequesting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const requestPermission = async () => {
        try {
            setIsRequesting(true)
            setError(null)

            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            // Stop the stream immediately since we just wanted the permission
            stream.getTracks().forEach(track => track.stop())

            toast({
                title: "Camera Access Granted",
                description: "You can now use the camera to capture your documents.",
            })

            onGranted()
        } catch (err) {
            console.error("Error requesting camera permission:", err)
            setError("Could not access camera. Please ensure you have granted camera permissions in your browser settings.")
            toast({
                title: "Camera Access Denied",
                description: "Please enable camera access in your browser settings to use this app.",
                variant: "destructive",
            })
        } finally {
            setIsRequesting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="space-y-4">
                    <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-semibold">Camera Access Required</h1>
                    <p className="text-muted-foreground">
                        This app needs access to your camera to capture images of your handwritten documents.
                        Your camera will only be used when you're actively taking photos.
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 p-4 rounded-lg text-destructive flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-left">{error}</p>
                    </div>
                )}

                <Button
                    className="w-full"
                    size="lg"
                    onClick={requestPermission}
                    disabled={isRequesting}
                >
                    {isRequesting ? "Requesting Access..." : "Grant Camera Access"}
                </Button>

                <p className="text-xs text-muted-foreground">
                    You can always change camera permissions through your browser settings.
                </p>
            </div>
        </div>
    )
} 