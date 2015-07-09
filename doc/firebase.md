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
strokePoints:
  $strokeId:
    $id: "$x:$y"
```
