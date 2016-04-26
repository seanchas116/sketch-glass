# Firebase data structure

```yaml
users:
  $id:
    name: string
    email: string
canvases:
  $id:
    name: string
collaborations:
  $canvas_id:
    $user_id:
strokes:
  $canvas_id:
    $id:
      user_id: $user_id
      brush:
        type: "pen" | "eraser"
        color: string
        width: number
      fragments:
        $id: "${base64 encoded list of float32 x1, y1, x2, y2, ...}"
```
