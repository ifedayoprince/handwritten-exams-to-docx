import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkMath from "remark-math"
import remarkDocx from '@/md-to-docx'
import * as path from "path"
import * as os from "os"
import * as fs from "fs"
import sharp from "sharp"
import { USER_PROMPT } from "@/app/utils/prompt"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const processedFiles: string[] = []

function addLog(message: string, type: "info" | "error" = "info") {
  console.log(`[${type.toUpperCase()}] ${message}`)
}

// Convert image to grayscale and return base64
async function processImage(dataUrl: string): Promise<string> {
  // Extract base64 data from data URL
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "")
  const buffer = Buffer.from(base64Data, "base64")

  // Convert to grayscale using sharp
  const processedBuffer = await sharp(buffer)
    .grayscale()
    .jpeg({ quality: 80 })
    .toBuffer()

  // Convert back to base64
  return processedBuffer.toString("base64")
}

export async function POST(req: NextRequest) {
  try {
    const { images, documentName } = await req.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      addLog("No images provided", "error")
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      addLog("OpenAI API key not configured", "error")
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    addLog(`Processing ${images.length} images for document: ${documentName}`)

    // Process all images to grayscale first
    const processedImages = await Promise.all(
      images.map(async (dataUrl) => {
        try {
          return await processImage(dataUrl)
        } catch (error) {
          addLog(`Error processing image: ${error}`, "error")
          return null;
        }
      })
    )

    // Filter out failed images
    const validImages = processedImages.filter((img): img is string => img !== null)

    if (validImages.length === 0) {
      addLog("No valid images after processing", "error")
      return NextResponse.json(
        { error: "No valid images after processing" },
        { status: 400 }
      )
    }

    addLog("Sending images to OpenAI for processing")

    // Process all images in a single API call
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        reasoning_effort: "minimal",
        messages: [
          {
            role: "system",
            content: USER_PROMPT,
          },
          {
            role: "user",
            content: [
              ...validImages.map((base64Image) => ({
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              } as any)),
            ],
          },
        ],
        // max_tokens: 4096,
      })

      const extractedText = response.choices[0]?.message?.content
      if (!extractedText) {
        throw new Error("No text extracted from images")
      }

      const docx = await unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkDocx)
        .process(extractedText);
      const docxBuffer = await docx.result;

      // Save the file
      const sanitizedName = documentName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `${sanitizedName}_${timestamp}.docx`

      const docxPath = path.join(os.homedir(), "Downloads/Handwritexam/DOCX")
      const markdownPath = path.join(os.homedir(), "Downloads/Handwritexam/Markdown")
      const filePath = path.join(docxPath, filename)
      const markdownFilePath = path.join(markdownPath, `${sanitizedName}_${timestamp}.md`)

      addLog("Saving files to " + filePath)

      if (!fs.existsSync(docxPath)) {
        fs.mkdirSync(docxPath, { recursive: true })
        fs.mkdirSync(markdownPath, { recursive: true })
      }

      fs.writeFileSync(filePath, docxBuffer as Buffer)
      fs.writeFileSync(markdownFilePath, extractedText)

      addLog(`Document saved: ${filename}`)
      processedFiles.unshift(filename)

      // Keep only the last 10 processed files
      if (processedFiles.length > 10) {
        processedFiles.pop()
      }

      return NextResponse.json({
        success: true,
        filename,
        message: "Document processed successfully",
      })
    } catch (error) {
      addLog(`Error processing with OpenAI: ${error}`, "error")
      throw error // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    addLog(`Error processing document: ${error}`, "error")
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    )
  }
}

