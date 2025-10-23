# 📝 Handwritten Exam Converter

> **Transform handwritten exam papers into digital documents with AI-powered OCR and intelligent formatting**

A web application that captures handwritten exam papers using your device's camera and converts them into professionally formatted Word documents using advanced AI technology. Perfect for educators, students, and institutions looking to digitize handwritten assessments.

Started off as a project to solve a personal need, I'll be improving it every session.

![Handwritten Exam Converter](https://img.shields.io/badge/Next.js-15.1.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5--Mini-green?style=for-the-badge&logo=openai)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=for-the-badge&logo=pwa)

## ✨ Features

### 🎯 **Core Functionality**

- **📸 Real-time Camera Capture**: High-quality image capture with multiple camera support
- **🤖 AI-Powered OCR**: Advanced OpenAI GPT-5 Mini integration for accurate text extraction
- **📄 Smart Document Processing**: Automatic conversion to professionally formatted Word documents
- **🔄 Batch Processing**: Queue multiple documents for sequential processing
- **📱 Progressive Web App**: Install as a native app on any device

### 🎨 **User Experience**

- **Intuitive Interface**: Clean, modern UI with drag-and-drop image reordering
- **Real-time Preview**: Live camera feed with capture controls
- **Document Management**: Easy naming, editing, and organization of documents
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Professional dark interface for extended use

### 🔧 **Advanced Features**

- **Mathematical Equation Support**: LaTeX rendering for complex mathematical expressions
- **Table Recognition**: Automatic table detection and formatting
- **Multi-page Support**: Handle documents spanning multiple pages
- **Image Processing**: Automatic grayscale conversion and optimization
- **Queue Management**: Background processing with status indicators

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PNPM package manager
- OpenAI API key
- Modern web browser with camera support

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ifedayoprince/handwritten-exams-to-docx.git
   cd handwritten-exams-to-docx
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Add your OpenAI API key to your `.env.local` file:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### **Technology Stack**

| Component               | Technology              | Purpose                             |
| ----------------------- | ----------------------- | ----------------------------------- |
| **Frontend**            | Next.js 15.1.0          | React framework with App Router     |
| **UI Components**       | Radix UI + Tailwind CSS | Accessible, customizable components |
| **Styling**             | Tailwind CSS            | Utility-first CSS framework         |
| **AI Processing**       | OpenAI GPT-5 Mini       | Advanced OCR and text extraction    |
| **Document Generation** | Custom MD-to-DOCX       | Markdown to Word conversion         |
| **Image Processing**    | Sharp                   | Image optimization and conversion   |
| **PWA**                 | Next-PWA                | Progressive Web App capabilities    |
| **Type Safety**         | TypeScript 5.0          | Type-safe development               |

### **Project Structure**

```
handwritten-exam-converter/
├── app/                          # Next.js App Router
│   ├── api/process/             # API endpoint for document processing
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main application page
│   └── utils/                   # Utility functions and prompts
├── components/                   # React components
│   ├── camera-capture.tsx       # Main camera interface
│   ├── camera-permission.tsx    # Permission handling
│   ├── image-gallery.tsx        # Image management
│   └── ui/                      # Reusable UI components
├── md-to-docx/                  # Custom document converter
│   ├── transformer.ts           # Markdown to DOCX transformer
│   ├── latex.ts                 # LaTeX equation processing
│   └── models/                  # Type definitions
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
└── public/                      # Static assets
```

## 🔄 How It Works

### **1. Image Capture**

- Users capture images using their device camera
- Real-time preview with professional controls
- Support for multiple camera devices
- Drag-and-drop reordering of captured images

### **2. AI Processing**

- Images are processed through OpenAI's GPT-5 Mini model
- Advanced OCR extracts text with high accuracy
- Mathematical equations are converted to LaTeX format
- Tables and graphics are properly identified and formatted

### **3. Document Generation**

- Extracted text is converted to structured Markdown
- Custom transformer converts Markdown to Word format
- Professional formatting with proper typography
- Automatic file naming and organization

### **4. Output Management**

- Documents saved to user's Downloads folder
- Both DOCX and Markdown versions created
- Queue system for batch processing
- Real-time status updates and notifications

## 🎯 Use Cases

### **Educational Institutions**

- Digitize handwritten exam papers
- Create digital archives of assessments
- Improve accessibility for students
- Streamline grading processes

### **Educators**

- Convert handwritten notes to digital format
- Create professional exam papers
- Maintain consistent formatting
- Reduce manual transcription work

### **Students**

- Digitize handwritten assignments
- Create searchable study materials
- Convert notes to editable documents
- Improve organization and accessibility

## 🛠️ Configuration

### **Environment Variables**

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here
```

### **Customization Options**

- **AI Prompts**: Modify extraction logic in `app/utils/prompt.ts`
- **Document Formatting**: Customize styles in `md-to-docx/transformer.ts`
- **UI Theme**: Update colors and styling in `tailwind.config.js`

## 🔧 Development

### **Available Scripts**

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-5 Mini model
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Next.js Team** for the amazing React framework
- **Sharp** for image processing capabilities

<div align="center">

**Made with ❤️ for educators and students worldwide**

[⭐ Star this repo](https://github.com/ifedayoprince/handwritten-exams-to-docx)

</div>
