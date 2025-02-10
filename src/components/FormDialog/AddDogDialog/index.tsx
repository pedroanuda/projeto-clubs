import { DialogContent, DialogActions, Select, TextField, Button, 
Stack, FormControl, InputLabel, MenuItem, Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";
import { AddIcon1 } from "common/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDog, getBreeds } from "common/services/dogService";
import { getOwners } from "common/services/ownerService";
import { useState } from "react";
import {v4 as uuid4} from "uuid";
import styles from "./AddDogDialog.module.css";
import IOwner from "common/interfaces/IOwner";
import IDog from "common/interfaces/IDog";

interface AddDogDialogProps {
  handleClose?: () => void;
}

export default function AddDogDialog({ handleClose }: AddDogDialogProps) {
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogGender, setDogGender] = useState("");
  const [dogClub, setDogClub] = useState("no");
  const [dogOwner, setDogOwner] = useState("");
  const [ownerD, setOwnerD] = useState(false);
  const queryClient = useQueryClient();

  const breedsQuery = useQuery({
    queryKey: ['breeds'],
    queryFn: getBreeds
  });
  const ownersQuery = useQuery({
    queryKey: ['owners'],
    queryFn: () => getOwners(undefined, undefined, true)
  })

  const mutation = useMutation({
    mutationFn: addDog,
    onSuccess: () => {
      console.log("Added new dog successfully!");
      queryClient.invalidateQueries({queryKey: ["dogos"]});
    }
  })

  const getBreedName = (breedId: number) => {
    if (!breedsQuery.data) return "N/A";

    let name = breedsQuery.data.find(b => b.id == breedId)?.name;
    return name ?? "N/A";
  }

  const getOwnerInfo = (ownerId: string) => {
    return ownersQuery.data.find((o: any) => o.id == ownerId);
  }

  const handleAdd = () => {
    let id = uuid4();
    let newDog: IDog = {
      id,
      name: dogName,
      gender: dogGender,
      breed_id: parseInt(dogBreed),
      breed_name: getBreedName(parseInt(dogBreed)),
      owners: [getOwnerInfo(dogOwner)],
      shelved: false,
      birthday: null,
      default_pack_price: null,
      notes: null,
      picture_path: null
    }
    mutation.mutate(newDog);

    setDogName("");
    setDogBreed("");
    setDogGender("");
    setDogClub("no");

    if (handleClose) handleClose();
  }

  if (ownersQuery.isPending || breedsQuery.isPending) return (
    <DialogContent>
      Carregando...
    </DialogContent>
  )

  if (ownersQuery.isError || breedsQuery.isError) return (
    <DialogContent>
      Algo deu errado.
    </DialogContent>
  )

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
              <Select labelId="owner-label" label="Dono" value={dogOwner} 
              onChange={e => {if (e.target.value != "-1") setDogOwner(e.target.value)}}>
                <MenuItem value={"-1"} style={{gap: ".5rem"}} onClick={() => setOwnerD(true)}>
                  <AddIcon1 />
                  Adicionar Dono
                </MenuItem>
                {ownersQuery.data.map((owner: IOwner, i: number) => (
                  <MenuItem key={i} value={owner.id}>
                    {owner.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className={styles.stackRow}>
            <FormControl size="small" style={{width: "60%"}}>
              <InputLabel id="breed-label">Raça</InputLabel>
              <Select value={dogBreed.toString()} labelId="breed-label"
              label="Raça" defaultValue="" onChange={e => setDogBreed(e.target.value)} MenuProps={{style: {maxHeight: "280px"}}}>
                <MenuItem value={""} disabled>Nenhuma</MenuItem>
                {breedsQuery.data.map((b: any, i) => (
                  <MenuItem value={b.id} key={i}>{b.name}</MenuItem>
                ))}
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
          {dogClub === "yes"
          && <TextField label="Valor" />
          }
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancelar</Button>
      <Button variant="contained" onClick={handleAdd} type="submit">Cadastrar</Button>
    </DialogActions>
    </>
  )
}
