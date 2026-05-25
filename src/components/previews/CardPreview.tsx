type CardPreviewProps = {
  title: string
  description: string
}

const CardPreview = ({ title, description }: CardPreviewProps) => {
  return (
    <article className="preview-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  )
}

export default CardPreview
