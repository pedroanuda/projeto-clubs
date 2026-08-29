import { DialogContent, FormControlLabel } from "@mui/material";
import { AddIcon1 } from "common/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDog, getBreeds } from "common/services/dogService";
import { getOwners } from "common/services/ownerService";
import { useState } from "react";
import {v4 as uuid4} from "uuid";
import styles from "./AddDogDialog.module.css";
import IOwner from "common/interfaces/IOwner";
import IDog from "common/interfaces/IDog";
import { useNavigate } from "react-router";
import { Button, Radio, RadioGroup, Select, SelectOption, TextField } from "actify";
import StylishDialog from "components/StylishDialog";

interface AddDogDialogProps {
  open: boolean,
  onClose: () => void,
}

export default function AddDogDialog({ open, onClose }: AddDogDialogProps) {
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogGender, setDogGender] = useState("");
  const [dogClub, setDogClub] = useState("no");
  const [dogOwner, setDogOwner] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const breedsQuery = useQuery({
    queryKey: ['breeds'],
    queryFn: getBreeds
  });
  const ownersQuery = useQuery({
    queryKey: ['owners'],
    queryFn: () => getOwners({onlyIdAndName: true})
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
    return ownersQuery.data?.find((o: any) => o.id == ownerId);
  }

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let ownerInfo = getOwnerInfo(dogOwner);
    let newDog: IDog = {
      id: null,
      name: dogName,
      gender: dogGender,
      breed_id: parseInt(dogBreed),
      breed_name: getBreedName(parseInt(dogBreed)),
      owners: ownerInfo ? [ownerInfo] : undefined,
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

    if (onClose) onClose();
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
    <StylishDialog open={open} onClose={onClose} className="max-w-[80%] w-full md:max-w-[70%] lg:max-w-[60%]">
      <form onSubmit={handleAdd} method='POST'>
      <div className={styles.wholeDialog}>
        <h2>Cadastrar cachorro</h2>
        <div className="picture"></div>
        <div className={`${styles.stackRow} ${styles.fiftyFifty}`}>
          <TextField value={dogName} name="dog_name" onChange={value => setDogName(value)}
          variant="outlined" label="Nome" isRequired />
          <Select label="Dono" onSelectionChange={key => {if (key != "-1") setDogOwner(key?.toString() ?? "")}}
          variant="outlined" name="dog_owner" isRequired>
            <SelectOption key={"-1"} href={"../owners/create"}  textValue="Adicionar Dono">
              <div onClick={() => navigate("../owners/create")}>
                <AddIcon1 />
                Adicionar Dono
              </div>
            </SelectOption>
            <>
            {ownersQuery.data.map((owner: IOwner, i: number) => (
              <SelectOption key={owner.id}>
                {owner.name}
              </SelectOption>
            ))}
            </>
          </Select>
        </div>
        <div className={`${styles.stackRow} ${styles.sixtyForty}`}>
          <Select style={{width: "60%"}} variant="outlined" name="dog_breed" isRequired
          label="Raça" disabledKeys={"0"} onSelectionChange={key => setDogBreed(key?.toString() ?? "0")}>
            <SelectOption key={"0"}>Nenhuma</SelectOption>
            <>
            {breedsQuery.data.map((b: any, i) => (
              <SelectOption key={b.id}>{b.name}</SelectOption>
            ))}
            </>
          </Select>
          <Select label="Sexo" disabledKeys={"0"} onSelectionChange={key => setDogGender(key?.toString() ?? "0")}
          variant="outlined" name="dog_gender" isRequired>
            <SelectOption key="0">Nenhum</SelectOption>
            <SelectOption key="male">Macho</SelectOption>
            <SelectOption key="female">Fêmea</SelectOption>
          </Select>
        </div>

        <h4 className="select-none mt-4">Faz parte de um pacote?</h4>
        <RadioGroup name="isFromAPackage" aria-label="Faz parte de um pacote?" 
        className={styles.radios} orientation="horizontal" value={dogClub}
        onChange={value => setDogClub(value)}>
          <Radio value="yes">Sim</Radio>
          <Radio value="no">Não</Radio>
        </RadioGroup>
          
        {dogClub === "yes"
        && <TextField label="Valor" variant="outlined" />
        }
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        <Button variant="text" onPress={onClose}>Cancelar</Button>
        <Button variant="tonal" type="submit">Cadastrar</Button>
      </div>
      </form>
    </StylishDialog>
  )
}
