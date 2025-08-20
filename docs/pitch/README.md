# Finsight Pitch Deck

## Overview
This directory contains the refined 5-minute pitch presentation for the Finsight project, featuring engaging content at a 6th grade reading level, expanded speaker notes, and improved visual design.

## How to Run the Slides

1. **Start the development server:**
   ```bash
   cd client
   npm run dev
   # or if you have pnpm installed:
   # pnpm dev
   ```

2. **Navigate to the pitch:**
   - Open your browser to `http://localhost:5173/pitch`
   - Or click the "View Pitch Deck" button on the main page

## Export Options for Google Slides

The presentation now includes four export options specifically designed for different use cases:

### 1. **Text Export (Recommended for Google Slides)**
- **Button**: "Export Text for Google Slides"
- **Format**: Plain text file (.txt)
- **Best for**: Easy copy-paste into Google Slides
- **How to use**:
  1. Download the .txt file
  2. Open and copy all content (Ctrl+A, Ctrl+C)
  3. In Google Slides: Insert > Slides from another presentation
  4. Paste the content

### 2. **HTML Export**
- **Button**: "Export HTML for Google Slides"
- **Format**: HTML file with styled content
- **Best for**: Visual reference and content extraction
- **How to use**:
  1. Download the HTML file
  2. Open in browser and copy content
  3. Paste into Google Slides

### 3. **PowerPoint Export (NEW!)**
- **Button**: "Export PowerPoint (.pptx)"
- **Format**: Native PowerPoint file (.pptx)
- **Best for**: Professional presentations, editing in PowerPoint, sharing with stakeholders
- **How to use**:
  1. Click the button to download the .pptx file
  2. Open in PowerPoint, Google Slides, or any presentation software
  3. Customize design and layout as needed
  4. Fully compatible with all major presentation software

### 4. **PDF Export**
- **Button**: "Export PDF"
- **Format**: Print-optimized PDF
- **Best for**: Printing or sharing as-is
- **Google Slides**: Can import PDFs but may lose formatting

## Controls
- **Navigation**: Use left/right arrow keys or click Previous/Next buttons
- **Speaker Notes**: Toggle speaker notes with the "Show/Hide Speaker Notes" button
- **Progress**: Click on the dots below the slide to jump to specific slides
- **Export**: Use any of the three export buttons for different formats

## Content Details

### Speaker Notes Word Count
- **Total**: ~900 words
- **Duration**: 6-7 minutes at 130 wpm
- **Format**: Engaging stories with clear "What, So What, Now What" structure

### Slide Structure & Improvements
1. **Title Slide** - Added compelling opening question and improved visual hierarchy
2. **Problem** - Enhanced with relatable analogies and emotional hooks
3. **Solution** - Focused on benefits and transformation story
4. **Tech Stack** - Explained "why" each technology choice matters
5. **Core Flow** - Customer journey story with Sarah's real example
6. **Lessons Learned** - Technical insights turned into business wisdom
7. **What's Next** - Exciting roadmap with clear vision statement

### Key Improvements Made
- **Language**: Simplified to 6th grade reading level while maintaining technical credibility
- **Structure**: Added hooks, transitions, and clear frameworks
- **Engagement**: Included customer stories, analogies, and rhetorical questions
- **Visual Design**: Enhanced with color-coded sections and better typography
- **Speaker Notes**: Expanded with delivery guidance and emotional connections

## Reading Level Guidelines Applied
- Active voice throughout
- Sentences kept under 20 words
- Familiar words and concrete examples
- Analogies and metaphors (LEGO blocks, race car, universal translator)
- Complex ideas broken into digestible pieces

## Technical Notes

### Dependencies
- React 18 + TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- React Router for navigation

### Browser Compatibility
- Modern browsers with ES6+ support
- Print functionality works in Chrome, Firefox, Safari
- Responsive design for various screen sizes

### Performance
- Slides load instantly (no external dependencies)
- Smooth transitions between slides
- Efficient re-rendering with React hooks

## Delivery Tips

### Timing
- **Slide 1**: 30 seconds (hook and introduction)
- **Slide 2**: 1 minute (problem and emotional connection)
- **Slide 3**: 1 minute (solution and benefits)
- **Slide 4**: 1 minute (tech stack and confidence building)
- **Slide 5**: 1 minute (customer story and flow)
- **Slide 6**: 1 minute (lessons and credibility)
- **Slide 7**: 1 minute (roadmap and call to action)

### Engagement Techniques
- Use the customer story (Sarah) to make it relatable
- Emphasize the transformation (weeks to minutes)
- Connect to audience's pain points
- Use the traffic light system analogy
- End with the vision statement
