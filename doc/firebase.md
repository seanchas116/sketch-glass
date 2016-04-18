# Firebase data structure

```yaml
users:
  $uid:
    name: string
    email: string
canvases:
  $id:
    name: string
    description: string
    ownerId: string
canvasCollaborators:
  $canvasId:
    $userId:
strokes:
  $canvasId:
    $id:
      user: $userId
      brush:
        type: "pen" | "eraser"
        color: string
        width: number
      fragments:
        $id: "${base64 encoded list of float32 x1, y1, x2, y2, ...}"
```
