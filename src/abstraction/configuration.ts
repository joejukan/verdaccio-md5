import { User, Group } from ".";

export interface Configuration {
    users?: Array<User>;
    groups?: Group;
}