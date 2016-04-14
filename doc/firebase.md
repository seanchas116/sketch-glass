# Firebase data structure

```yaml
users:
  $id:
    name: string
    email: string
    twitterId: string
canvases:
  $id:
    name: string
    description: string
    ownerId: string
canvasUsers:
  $canvasId:
    $userId:
strokes:
  $canvasId:
    $id:
      brush:
        color: string
        width: number
      fragments:
        $id: "${base64 encoded list of float32 x1, y1, x2, y2, ...}"
```