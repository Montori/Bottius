Object.defineProperty(exports, "__esModule", { value: true });
const PingCommand_1 = require("../Commands/PingCommand");
const HeadpatCommand_1 = require("../Commands/HeadpatCommand");
const QuestCommand_1 = require("../Commands/QuestCommand");
const StatsCommand_1 = require("../Commands/StatsCommand");
const PerkCommand_1 = require("../Commands/PerkCommand");
const LeaderboardCommand_1 = require("../Commands/LeaderboardCommand");
const ActivityCommand_1 = require("../Commands/ActivityCommand");
const HelpCommand_1 = require("../Commands/HelpCommand");
const PermissionCommand_1 = require("../Commands/PermissionCommand");
const SuggestCommand_1 = require("../Commands/SuggestCommand");
const HugCommand_1 = require("../Commands/HugCommand");
class CommandService {
    constructor(bot) {
        this.commandMap = new Map();
        this.bot = bot;
        this.commandMap.set("ping", new PingCommand_1.PingCommand());
        this.commandMap.set("headpat", new HeadpatCommand_1.HeadpatCommand());
        this.commandMap.set("quest", new QuestCommand_1.QuestCommand());
        this.commandMap.set("stats", new StatsCommand_1.StatsCommand());
        this.commandMap.set("perk", new PerkCommand_1.PerkCommand());
        this.commandMap.set("leaderboard", new LeaderboardCommand_1.LeaderboardCommand());
        this.commandMap.set("setactivity", new ActivityCommand_1.ActivityCommand());
        this.commandMap.set("help", new HelpCommand_1.HelpCommand());
        this.commandMap.set("permission", new PermissionCommand_1.PermissionCommand());
        this.commandMap.set("suggest", new SuggestCommand_1.SuggestCommand());
        this.commandMap.set("hug", new HugCommand_1.HugCommand());
    }
    static getInstance() {
        return this.instance;
    }
    static init(bot) {
        if (!CommandService.instance) {
            this.instance = new CommandService(bot);
        }
    }
    runCommand(name, bot, message, args) {
        name = name.toLowerCase();
        if (this.commandMap.get(name)) {
            this.commandMap.get(name).run(bot, message, args);
        }
    }
    getCommandMap() {
        return this.commandMap;
    }
}
exports.CommandService = CommandService;
