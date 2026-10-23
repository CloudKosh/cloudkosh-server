import AppDbContext from "@entity-access/server-pages/dist/core/AppDbContext.js";
import User from "./entities/User.js";

export default class KoshDbContext extends AppDbContext {
    
    public users = this.model.register(User);

}