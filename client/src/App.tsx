import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            React + Vite + TypeScript
          </h1>
          <p className="text-lg text-muted-foreground">
            with Tailwind CSS and shadcn/ui
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Counter Example</CardTitle>
              <CardDescription>
                Test the interactive functionality with this counter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-semibold text-center">
                Count: {count}
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setCount(count + 1)}>
                  Increment
                </Button>
                <Button variant="outline" onClick={() => setCount(count - 1)}>
                  Decrement
                </Button>
                <Button variant="destructive" onClick={() => setCount(0)}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Styling Examples</CardTitle>
              <CardDescription>
                Various components showcasing Tailwind and shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This is a styled container using Tailwind CSS classes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Your development environment is ready!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ React 18 with TypeScript</li>
              <li>✅ Vite for fast development</li>
              <li>✅ Tailwind CSS for styling</li>
              <li>✅ shadcn/ui components</li>
              <li>✅ Path aliases configured (@/* → src/*)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App