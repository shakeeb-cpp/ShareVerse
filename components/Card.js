const Card = ({ children, noPadding, roundedbottom }) => {

  let classes = ' bg-[#000] text-white mb-0';
  if (!noPadding) {
    classes += ' md:p-4 p-2';
  }
  if (!roundedbottom) {
    classes += ' '
  }
  if (roundedbottom) {
    classes += ' rounded-b-md'
  }
  return (
    <div className={classes}>
      {children}
    </div>
  )
}

export default Card
