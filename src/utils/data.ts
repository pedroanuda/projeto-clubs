import { BaseDirectory, writeFile, readTextFile, exists, createDir } from "@tauri-apps/api/fs";

export default class DataFile<T> {
    private data: T | null = null;

    constructor (
        public readonly dirPath: string,
        public readonly fileName: string,
        /** So tauri can use this information to take care of the files. */
        private baseDir: BaseDirectory
    ) {
        exists(dirPath).then(res => {
            if (!res) createDir(".", {
                dir: baseDir,
                recursive: true
            })
        })
    }

    public async save(newState: T): Promise<void> {
        try {
            await writeFile(
                this.fileName,
                JSON.stringify(newState, null, 2),
                {dir: this.baseDir}
            )
            this.data = newState;
        } catch (e) {
            console.warn(e);
        }
    }

    public async load(): Promise<void> {
        try {
            const stringData = await readTextFile(
                this.fileName,
                {dir: this.baseDir}
            )
            this.data = JSON.parse(stringData)
        } catch (e) {
            await this.save(JSON.parse(`[]`));
            throw Error("It wasn't possible to load the file, but an file was created.")
        }
    }

    get dataContent() {
        return this.data;
    }
}