import * as md5 from "md5";
import * as Logger from "bunyan";
import {access} from "@joejukan/web-kit";
import {Argumenter} from "@joejukan/argumenter/lib";
import { Configuration, User, Group } from "."
export default class MD5Plugin {
    public constructor(private config: Configuration, private stuff: {logger: Logger}){
        this.logger.info('Construct MD5 Plugin')
    }

    public get logger(): Logger {
        return this.stuff.logger;
    }
    public get users(): Array<User>{
        return access(this.config, 'users') || [];
    }

    public get group(): Group {
        return access(this.config, 'group') || {};
    }

    public authenticate(username: string, password: string, callback: Function){

        let hash = md5(password);
        let user = this.getUser(username);

        if(!user){
            return callback(null, false);
        }

        if(hash === user.hash && username === user.name){
            let groups = this.getGroups(user);
            groups.splice(0,0, user.name);
            return callback(null, groups);
        }

        return callback(null, false);
    }

    public adduser(username: string, password: string, callback: Function) {
        return this.authenticate(username, password, callback);
    }


    public getUser(name: string): User {
        let users = this.users;
        for(let i = 0; i < users.length; i++){
            let user = users[i];
            if(user.name === name){
                return user;
            }
        }
        return <any> undefined;
    }

    public getGroups(username: string): Array<string>;
    public getGroups(user: User): Array<string>;
    public getGroups(...args: any[]): Array<string>{
        let argue = new Argumenter(args);
        let name: string = argue.string;
        let user = <User> argue.object;
        let results = new Array<string>();
        let group = this.group;

        if(!name && user){
            name = user.name;
        }

        for(let k in group){
            let groups = group[k];

            groups.forEach( username => {
                if(username && name){
                    if(username === name){
                        results.push(k);
                    }
                }
            })
        }

        return results;
    }
}