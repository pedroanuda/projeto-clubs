// Temporary breaking changes for this commit

import { useNavigate, useParams } from 'react-router'
import ErrorPage from './ErrorPage';
import DogPicture from 'components/DogPicture';
import { CSSProperties, useState } from 'react';
import { BackIcon, PencilIcon, CancelIcon, AddIcon1, ToFileIcon } from 'common/icons';
import DetailsAction from 'components/DetailsAction';
import DetailsField from 'components/DetailsField';
import { Fab, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem } from '@mui/material';

interface stylesComp {
    container: CSSProperties,
    actions: CSSProperties,
    form: CSSProperties
}

const styles: stylesComp = {
    container: {
        padding: "1rem",
        backgroundColor: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
        boxSizing: "border-box"
    },
    actions: {
        display: "grid",
        width: "100%",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "1rem"
    },
    form: {
        display: "flex",
        padding: "0 0 0 1rem",
        gap: ".8rem",
        flexWrap: "wrap"
    }
}

export default function DogDetails() {
    const dogId = useParams().id;
    const dogObject = {};
    const [editOn, setEditOn] = useState(false);
    const navigate = useNavigate();
    const [shelveOpen, setShelveOpen] = useState(false);
    
    const [dogName, setDogName] = useState<string | number | undefined>(undefined);
    const [dogBreed, setDogBreed] = useState<number | undefined>(undefined);
    const [dogGender, setDogGender] = useState<string | number | undefined>(undefined);

    function saveDog() {
        if (dogId && dogBreed && dogGender && dogObject) {}
    //     updateDog({
    //         id: dogId as string, name: dogName as string,
    //         breed_id: dogBreed, gender: dogGender as string
    //     });
    }

    if (dogObject) return (
        <div style={styles.container}>
            <div style={styles.actions}>
                <DetailsAction action={() => navigate(-1)} icon={BackIcon} text="Voltar" />
                <DetailsAction action={() => setShelveOpen(true)} icon={ToFileIcon} text={false ? "Desarquivar" : "Arquivar"} />
                <DetailsAction action={() => setEditOn(!editOn)} icon={editOn ? CancelIcon : PencilIcon} text={editOn ? "Cancelar" : "Editar"} />
            </div>
            <div>
                <DogPicture picPath={undefined} editMode={editOn} style={{float: 'left'}} />
                <form action="" style={styles.form}>
                    <DetailsField editStyle={{flexGrow: 2}} name={"Nome"} value={dogName} valueSetter={setDogName} placeholder="Insira o novo nome..." viewOnly={!editOn} whenNothingDisplay='Não informado'/>
                    {/* <DetailsField editStyle={{flexGrow: 1}} name={"Dono(s)"} value={dogOwner} valueSetter={setDogOwner} placeholder='Selecione o novo dono...' type='select' viewOnly={!editOn} whenNothingDisplay='Não informado(s)'>
                        <MenuItem style={{gap: ".5rem"}}>
                            <AddIcon1 />
                            Adicionar Dono
                        </MenuItem>
                    </DetailsField> */}
                    <DetailsField name={"Raça"} value={dogBreed} placeholder='Insira a nova raça...' type='select' viewOnly={!editOn} whenNothingDisplay='Não informada' viewOnlyDisplay={`${dogBreed?.toString().slice(0, 1)?.toUpperCase()}${dogBreed?.toString().slice(1)}`}>
                        <MenuItem value={""} disabled>Nenhuma</MenuItem>
                        {/* {breeds.map(b => (
                            <MenuItem value={b.id}>{b.presentation}</MenuItem>
                        ))} */}
                    </DetailsField>
                    <DetailsField type="select" name='Sexo' whenNothingDisplay='Não informado' viewOnly={!editOn}
                    value={dogGender} valueSetter={setDogGender} viewOnlyDisplay={dogGender === "male" ? "Macho" : dogGender === "female" ? "Fêmea" : undefined}>
                        <MenuItem value="" disabled>Nenhum</MenuItem>
                        <MenuItem value="male">Macho</MenuItem>
                        <MenuItem value="female">Fêmea</MenuItem>
                    </DetailsField>
                    {/* <DetailsField type='cel' name="Número de Celular" whenNothingDisplay='Não informado' viewOnly={!editOn}
                    value={} valueSetter={} /> */}
                </form>
            </div>
            <Dialog sx={{zIndex: 2}} open={shelveOpen} onClose={() => setShelveOpen(false)}>
                <DialogTitle>Arquivar "{dogName}"?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Reconheça que após o arquivamento, é possível achar {dogName} com o filtro de busca.
                    </DialogContentText>
                    <DialogActions>
                        <Button onClick={() => setShelveOpen(false)}>Fechar</Button>
                        <Button onClick={() => null}>Arquivar</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            <Fab color="primary" variant="extended" sx={{display: editOn ? "block" : "none", position: "fixed", right: 30, bottom: 30}}
            onClick={saveDog}>
                Salvar
            </Fab>
        </div>
    )

    else return <ErrorPage title='Erro ao tentar visualizar.' subtitle='Não foi possível encontrar esse cachorro.' />
}
