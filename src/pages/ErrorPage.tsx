import { CSSProperties } from "react"
import { Button } from "@mui/material"
import { useNavigate } from "react-router"

interface ErrorPageProps {
    /** That's the title of the error page */
    title?: string,
    /** That's a whole optional parameter which creates an subtitle to the big one title */
    subtitle?: string,
    /** That's the location which the button will send the user to when clicking. It works with the function coming from {@link useNavigate} hook. */
    locationTo?: string,
    /** That's the text which labels the button. */
    buttonText?: string
}

const styles: {container: CSSProperties, titleS: CSSProperties} = {
    container: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem"
    },
    titleS: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    }
}
    

export default function ErrorPage({ title, subtitle, locationTo, buttonText }: ErrorPageProps) {
    const navigate = useNavigate();

    return (
    <div style={styles.container}>
        <div style={styles.titleS}>
            <h1>
                {title ? title : "Algo deu errado."}
            </h1>
            {subtitle && <h4>{subtitle}</h4>}
        </div>
        <Button variant="contained" onClick={() => locationTo ? navigate(locationTo) : navigate(-1)}>
            {buttonText ? buttonText : "Voltar"}
        </Button>
    </div>
    )
}
