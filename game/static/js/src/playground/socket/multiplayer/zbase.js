class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app6916.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }


    start() {

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

    receive_create_player() {
        
    }

}
