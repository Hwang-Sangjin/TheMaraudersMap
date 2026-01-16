export default function Footprint({ isLeft, angle = 0, className = "" }) {
  const footRotation = isLeft ? -5 : 5;
  const offsetDistance = 10;

  const totalRotation = angle + footRotation;

  const movementAngle = angle - 90;
  const offsetAngle = isLeft ? movementAngle - 90 : movementAngle + 90;

  const offsetX = Math.cos((offsetAngle * Math.PI) / 180) * offsetDistance;
  const offsetY = Math.sin((offsetAngle * Math.PI) / 180) * offsetDistance;

  return (
    <div
      className={className}
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px) rotate(${totalRotation}deg)`,
        width: "40px",
        height: "40px",
      }}
    >
      <svg
        fill="#372116"
        width="100%"
        height="100%"
        viewBox="0 0 297 297"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path d="m148.5,0c-36.451,0.001-65.999,66-65.999,99.5 0,24.28 8.668,73.774 13.438,99.18 1.812,9.647 3.562,15.82 14.728,15.82h37.833 37.833c11.166,0 12.916-6.173 14.728-15.82 4.77-25.405 13.438-74.899 13.438-99.18 0-33.5-29.548-99.499-65.999-99.5z"></path>
          <path d="m187.999,231.5h-79c-5.5,0-10.833,4-10.833,9.5v6.5c0,27.338 22.162,49.5 49.5,49.5 27.338,0 49.5-22.162 49.5-49.5v-6.5c0-5.5-3.667-9.5-9.167-9.5z"></path>
        </g>
      </svg>
    </div>
  );
}
