import createStore from "unistore";
import { IgApiClient } from "instagram-private-api";
import { Config } from "./config";

interface State {
	serverCalls: number; // TODO add a limit for this

	config: Config;
	client: IgApiClient;
}

// TODO without unistore
const store = createStore();
store.change = (fn: changeFunction): void => store.setState(fn(store.getState() as State));

const initState: Partial<State> = {
	serverCalls: 0
};

store.setState(initState);

export { store, State };
