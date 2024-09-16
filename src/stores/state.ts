import { action, makeObservable, observable } from "mobx";

export interface Error {
    name: string | null;
    message: string | null;
}

class State {
    viewLoaded: boolean = false
    error: Error = null

    constructor() {
        makeObservable(this, {
            viewLoaded: observable,
            setViewLoaded: action,
            error: observable,
            setError: action
        })
    }

    setViewLoaded() {
        this.viewLoaded = true;
    }

    setError({ name, message }: Error) {
        if (name && message) {
            this.error = {
                name, message
            }
        } else {
            this.error = null;
        }

    }

}

const state = new State();
export default state;