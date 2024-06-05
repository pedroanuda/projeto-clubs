import { CSSProperties, useState } from "react";
import styles from "./DogPicture.module.css"

interface DogPictureProps {
    picPath: string | undefined,
    editMode?: boolean,
    style?: CSSProperties
}

export default function DogPicture({ picPath, editMode = false, style }: DogPictureProps) {
    const image = picPath ? picPath : "/dog_icon.png";
    const [hovering, setHovering] = useState(false);

    return (
    <div style={style} className={styles.picture} onMouseOver={() => setHovering(true)}
    onMouseOut={() => setHovering(false)}>
        <div className={styles.overlay} style={{
            backgroundImage: `url("/edit_overlay.png")`,
            display: (hovering && editMode) ? "block" : "none"
        }}></div>
        <div className={styles.image} style={{
            backgroundImage: `url(${image})`,
            backgroundColor: "#fff"
        }}></div>
    </div>
    )
}
