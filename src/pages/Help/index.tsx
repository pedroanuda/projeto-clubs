export default function Help() {
  return (
    <div className="flex h-full">
      <div className={`grow flex-col flex p-4`}>
        <div className="flex items-center justify-between h-10 mb-4">
          <h2 className="text-2xl font-bold">Ajuda e Dicas</h2>
        </div>
        <div className="grow">
          <span className="m-auto">Sem dicas por enquanto.</span>
        </div>
      </div>
    </div>
  )
}