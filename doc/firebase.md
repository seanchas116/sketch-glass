# Firebase data structure

```yaml
users:
  $id:
    name: string
    email_md5: string
canvases:
  $id:
    name: string
collaborations:
  c$canvas_id:
    u$user_id: true
  u$user_id:
    c$canvas_id: true
shapes:
  $canvas_id:
    $id:
      user_id: $user_id
      type: "stroke"
      brush:
        color: string
        width: number
      fragments:
        $id: "${base64 encoded list of float32 x1, y1, x2, y2, ...}"
```
