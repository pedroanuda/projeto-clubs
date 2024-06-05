import { DialogContent, DialogActions, Select, TextField, Button, 
Stack, FormControl, InputLabel, MenuItem, Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";
import { AddIcon1 } from "common/icons";
import { useDogsContext } from "common/contexts/Dogs";
import { useState } from "react";
import {v4 as uuid4} from "uuid";
import styles from "./AddDogDialog.module.css";

interface AddDogDialogProps {
  handleClose?: () => void;
}

export default function AddDogDialog({ handleClose }: AddDogDialogProps) {
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogGender, setDogGender] = useState("");
  const [dogClub, setDogClub] = useState("no");
  const { addDog } = useDogsContext();

  const handleAdd = () => {
    addDog({id: uuid4(), name: dogName, breed: dogBreed, gender: dogGender, 
    isFromAClub: dogClub === "yes" ? true : false, ownerId: "cagador", ownerName: "Roberto"});
    console.log(`caguei: ${dogClub === "yes"}`)
    setDogName("");
    setDogBreed("");
    setDogGender("");
    setDogClub("no");

    if (handleClose) handleClose();
  }

  return (
    <>
    <DialogContent className={styles.wholeDialog}>
      <Stack spacing={".5rem"}>
          <div className="picture"></div>
          <div className={styles.stackRow}>
            <TextField value={dogName} onChange={e => setDogName(e.target.value)} size="small"
            style={{width: "50%"}} label="Nome"/>
            <FormControl size="small" style={{width: "50%"}}>
              <InputLabel id="owner-label">Dono</InputLabel>
              <Select labelId="owner-label" label="Dono">
              <MenuItem style={{gap: ".5rem"}}>
                <AddIcon1 />
                Adicionar Dono
              </MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className={styles.stackRow}>
            <FormControl size="small" style={{width: "60%"}}>
              <InputLabel id="breed-label">Raça</InputLabel>
              <Select value={dogBreed} onChange={e => setDogBreed(e.target.value)} labelId="breed-label"
              label="Raça" defaultValue="">
                <MenuItem value={""} disabled>Nenhuma</MenuItem>
                <MenuItem value={"bulldog"}>Bulldog</MenuItem>
                <MenuItem value={"cocker"}>Cocker</MenuItem>
                <MenuItem value={"collie"}>Collie</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" style={{width: "40%"}}>
              <InputLabel id="gender-label">Sexo</InputLabel>
              <Select labelId="gender-label" value={dogGender} onChange={e => setDogGender(e.target.value)}
              label="Sexo" defaultValue="">
                <MenuItem value="" disabled>Nenhum</MenuItem>
                <MenuItem value="male">Macho</MenuItem>
                <MenuItem value="female">Fêmea</MenuItem>
              </Select>
            </FormControl>
          </div>
          <FormControl>
            <FormLabel id="isAClub-label">É Clubinho?</FormLabel>
            <RadioGroup row value={dogClub} onChange={e => setDogClub(e.target.value)}
            defaultValue={"no"} aria-labelledby="isAClub-label">
              <FormControlLabel value={"yes"} control={<Radio />} label="Sim"/>
              <FormControlLabel value={"no"} control={<Radio />} label="Não"/>
            </RadioGroup>
          </FormControl>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancelar</Button>
      <Button variant="contained" onClick={handleAdd} type="submit">Cadastrar</Button>
    </DialogActions>
    </>
  )
}
