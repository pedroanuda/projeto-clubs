import { FocusRing, Icon, Ripple, useFocusRing } from 'actify';
import IPet from 'common/interfaces/IPet';
import { useNavigate } from 'react-router';

export interface PetCardProps {
  pet: IPet;
}

function PetPicture({ picture_path, name }: { picture_path?: string | null; name: string }) {
  if (picture_path)
    return (
      <img src={picture_path} alt={name} className="w-24 h-24 rounded-2xl object-cover" />
    );

  return (
    <div className="w-24 h-24 rounded-2xl p-5 items-center flex justify-center bg-surface-variant text-on-surface-variant text-lg font-semibold">
      {name[0].toUpperCase()}
    </div>
  );
}

export default function PetCard(props: PetCardProps) {
  const { pet } = props;
  const navigate = useNavigate();
  const { focusProps, isFocusVisible } = useFocusRing();
  const gender = pet.gender === 'male' ? 'Macho' : 'Fêmea';

  return (
    <div
      className="relative cursor-pointer rounded-2xl"
      {...focusProps}
      tabIndex={0}
      onClick={() => navigate(`/dogdetails/${pet.id}`)}
    >
      <div className="p-4 rounded-2xl bg-surface-container text-on-surface select-none h-full flex gap-4">
        <PetPicture picture_path={pet.picture_path} name={pet.name} />
        <div className="flex flex-col grow">
          <h4 className="text-lg font-semibold">{pet.name}</h4>
          <span className="block">
            {pet.breed_name} • {gender}
          </span>
          {pet.owners && pet.owners.length > 0 && (
            <div className="flex items-center gap-1.5 mt-auto">
              <Icon fill style={{ '--md-icon-size': '1rem' } as React.CSSProperties}>
                Person
              </Icon>
              <span>
                {pet.owners[0].name} {pet.owners.length > 1 && `+ ${pet.owners.length - 1}`}
              </span>
            </div>
          )}
        </div>
      </div>
      <Ripple />
      {isFocusVisible && <FocusRing />}
    </div>
  );
}
