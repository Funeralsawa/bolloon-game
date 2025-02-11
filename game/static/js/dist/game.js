class AcGameMenu {
    constructor(root)
    {
        this.root = root;
        this.$menu = $(`
            <div class="ac-game-menu">
                <div class="ac-game-menu-field">
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
                        单人模式
                    </div>
                    <br>
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
                        多人模式
                    </div>
                    <br>
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                        退出
                    </div>
                </div>
            </div>
        `);
       this.$menu.hide();
       this.root.$ac_game.append(this.$menu); 
       this.$single = this.$menu.find('.ac-game-menu-field-item-single-mode');
       this.$multi = this.$menu.find('.ac-game-menu-field-item-multi-mode');
       this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

       this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });

        this.$multi.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });

        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }

    show() {
        //显示菜单
        this.$menu.show();
    }

    hide() {
        //关闭菜单
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false; //是否执行过start函数
        this.timedelta = 0; //当前距离上一帧的时间间隔 单位ms
        this.uuid = this.create_uuid();

    }

    create_uuid() {
        let res = "";
        for(let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start() {
        //在第一帧执行

    }

    update(){
        //每帧执行
    }

    on_destroy() {
        //在被销毁前执行一次
    }

    destroy() {
        //删掉该物品
        this.on_destroy();
        for(let i = 0; i < AC_GAME_OBJECTS.length; i++){
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {

    for(let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);
class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $('<canvas></canvas>');
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);

    }

    start() {

    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length
        this.friction = 0.9;
        this.eps = 0.01;
    }

    start() {

    }

    update() {
        if(this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
}
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01; //小于0.01就算0
        this.friction = 0.9;
        this.spent_time = 0;
        this.fireballs = [];
        this.cur_skill = null;
        this.is_die = false;
        this.attacked_num = 0;
        if(this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start() {
        if(this.character === "me") {
            this.add_listening_events();
        }
        else if(this.character === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });

        this.playground.game_map.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();

            if(e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);
                if(outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }else if(e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if(!outer.is_die && outer.cur_skill === "fireball") {
                    let fireball = outer.shoot_fireball(tx, ty);
                    if(outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if(e.which === 81) { // Q key
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01 / this.playground.scale;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "red";
        let speed = this.playground.height * 0.5 / this.playground.scale;
        let move_length = this.playground.height * 1 / this.playground.scale;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01 / this.playground.scale);
        this.fireballs.push(fireball);
        return fireball;
    }

    destroy_fireball(uuid) {
        for(let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if(fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        //粒子效果
        for(let i = 0; i < 20 + Math.random() * 5; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        //受伤效果
        this.radius -= damage;
        this.attacked_num += 1;
        if(this.radius < this.eps) {
            this.is_die = true;
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 1.5;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update() {
        this.update_move();
        this.render();
    }
   
    update_move() { //更新玩家移动
        this.spent_time += this.timedelta / 1000;

        if(this.spent_time > 3 && Math.random() < 1 / 300.0 && this.character === "robot") {
            let player = this.playground.players[0];  
            this.shoot_fireball(player.x, player.y);
        }
        if(this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if(this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(this.character === "robot") { //如果AI，那么不能停下来，继续移动
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                this.moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * this.moved;
                this.y += this.vy * this.moved;
                this.move_length -= this.moved;
            }
        }
    }

    render() {
        let scale = this.playground.scale;

        if(this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destroy() {
        for(let i = 0; i < this.playground.players.length; i++) {
            if(this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.01;
    }

    start() {

    }

    update() {
        if(this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        this.update_move();
        if(this.player.character !== "enemy") this.update_attack();
        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        for(let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)) {
                this.attack(player);
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        return this.get_dist(this.x, this.y, player.x, player.y) < this.radius + player.radius;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        if(this.playground.mode === "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        let fireball = this.player.fireball;
        for(let i = 0; i < this.player.fireballs.length; i++) {
            if(this.player.fireballs[i] === this) {
                this.player.fireballs.splice(i, 1);
                break;
            }
        }
    }
}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app6916.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }


    start() {
        this.receive();
    }

    receive() {
        let outer = this;
        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if(uuid === outer.uuid) return false;
            let event = data.event;
            if(event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if(event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if(event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if(event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }
        }
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event": "create_player",
            "uuid": outer.uuid,
            "username": username,
            "photo": photo,
        }));
    }

    get_player(uuid) {
        let players = this.playground.players;
        for(let i = 0; i < players.length; i++) {
            let player = players[i];
            if(player.uuid === uuid) return player;
        }
        return null;
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event": "move_to",
            "uuid": outer.uuid,
            "tx": tx,
            "ty": ty,
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if(player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event": "shoot_fireball",
            "uuid": outer.uuid,
            "tx": tx,
            "ty": ty,
            "ball_uuid": ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if(player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event": "attack",
            "uuid": outer.uuid,
            "attackee_uuid": attackee_uuid,
            "x": x,
            "y": y,
            "angle": angle,
            "damage": damage,
            "ball_uuid": ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if(attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

}
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
        }
    }

    hide() {
        //关闭playground
        this.$playground.hide();
    }
}
class Settings {
    constructor(root) {
        this.root = root;
        this.platform  = "WEB";
        if(this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";
        this.$settings = $(`
            <div class="ac-game-settings">
                <div class="ac-game-settings-login">
                    <div class="ac-game-settings-title">登录</div>
                    <div class="ac-game-settings-username">
                        <div class="ac-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="ac-game-settings-password">
                        <div class="ac-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                    <div class="ac-game-settings-submit">
                        <div class="ac-game-settings-item">
                            <button>登录</button>
                        </div>
                    </div>
                    <div class="ac-game-settings-error-messages">
                        <!--用户名密码错误 -->
                    </div>
                    <div class="ac-game-settings-option">
                        注册
                    </div>
                    <br>
                    <div class="ac-game-settings-acwing">
                        <img width="30" src="https://app6916.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                        <br>
                        <div>AcWing一键登录</div>
                    </div>
                </div>
                <div class="ac-game-settings-register">
                    <div class="ac-game-settings-title">注册</div>
                        <div class="ac-game-settings-username">
                            <div class="ac-game-settings-item">
                                <input type="text" placeholder="用户名">
                            </div>
                        </div>
                        <div class="ac-game-settings-password ac-game-settings-password-first">
                            <div class="ac-game-settings-item">
                                <input type="password" placeholder="密码">
                            </div>
                        </div>
                        <div class="ac-game-settings-password ac-game-settings-password-second">
                            <div class="ac-game-settings-item">
                                <input type="password" placeholder="确认密码">
                            </div>
                        </div>
                        <div class="ac-game-settings-submit">
                            <div class="ac-game-settings-item">
                                <button>注册</button>
                            </div>
                        </div>
                        <div class="ac-game-settings-error-messages">
                            <!--用户名密码错误 -->
                        </div>
                        <div class="ac-game-settings-option">
                            登录
                        </div>
                        <br>
                        <div class="ac-game-settings-acwing">
                            <img width="30" src="https://app6916.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                            <br>
                            <div>AcWing一键登录</div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_messages = this.$login.find(".ac-game-settings-error-messages");
        this.$login_option = this.$login.find(".ac-game-settings-option");

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_messages = this.$register.find(".ac-game-settings-error-messages");
        this.$register_option = this.$register.find(".ac-game-settings-option");

        this.$login.hide();
        this.$register.hide();
        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img')
        this.root.$ac_game.append(this.$settings);
        this.start();
    }

    start() {
        if(this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else {
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
    }

    acwing_login() {
        $.ajax({
            url: "https://app6916.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url); // 重定向当前页面
                }
            },
        });
    }

    add_listening_events_login() {
        let outer = this;
        this.$login_option.on("click", function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_option.on("click", function() {
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    login() {  //打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    login_on_remote() { //登录远程服务器
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_messages.empty();

        $.ajax({
            url: "https://app6916.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if(resp.result === "success") {
                    location.reload();
                }
                else {
                    outer.$login_error_messages.html(resp.result);
                }
            }
        });
    }

    register_on_remote() {  //在远程服务器上注册 
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_messages.empty();

        $.ajax({
            url: "https://app6916.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if(resp.result === "success") {
                    location.reload();
                }
                else {
                    outer.$register_error_messages.html(resp.result);
                }
            }

        });
    }

    logout_on_remote() {    //在远程服务器上登出
        if(this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();
        } else {
            $.ajax({
                url: "https://app6916.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(resp) {
                    if(resp.result === "success") {
                        location.reload();
                    }
                }
            });
        }
    }

    register() {    //打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp){
            if(resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app6916.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if(resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            },
        });
    }

    getinfo_web() {
        let outer = this;
        $.ajax({
            url: "https://app6916.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp) {

                if(resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    // outer.register();
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}
export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.AcWingOS = AcWingOS;
        this.$ac_game = $('#' + this.id);
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {

    }
}
