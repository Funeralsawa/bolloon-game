class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`)

        this.hide();
        this.root.$ac_game.append(this.$playground);
        
        this.start();
    }

    get_random_color() {
        let colors = ["red", "green", "blue", "yellow", "purple", "orange", "pink"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 10);
        this.width = unit * 16;
        this.height = unit * 10;
        this.scale = this.height;

        if(this.game_map) this.game_map.resize();
    }

    show(mode) {
        let outer = this;
        //打开playground
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.resize();
        this.mode = mode;
        this.state = "waiting"; //waiting -> fighting -> over
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0; //玩家人数
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, "white", 
            this.height * 0.15 / this.scale, "me", this.root.settings.usernsme, this.root.settings.photo));

        if(mode === "single mode") {
            for(let i = 0; i < 5; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, 
                    this.get_random_color(), this.height * 0.15 / this.scale, "robot"));
            }
        } else if(mode === "multi mode") {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
            this.chat_field = new ChatField(this);
        }
    }

    hide() {
        //关闭playground
        this.$playground.hide();
    }
}
