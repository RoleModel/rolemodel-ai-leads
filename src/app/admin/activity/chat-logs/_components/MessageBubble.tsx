interface Message {
  id: string
  role: string
  content: string
  created_at: string
}

export function MessageBubble({ message }: { message: Message }) {
  return (
    <div
      key={message.id}
      className={`admin-message ${
        message.role === 'user' ? 'admin-message--user' : 'admin-message--assistant'
      }`}
    >
      <div
        className={`admin-message__bubble ${
          message.role === 'user'
            ? 'admin-message__bubble--user'
            : 'admin-message__bubble--assistant'
        }`}
      >
        <div className="admin-message__content">{message.content}</div>
        <div className="admin-message__time">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
