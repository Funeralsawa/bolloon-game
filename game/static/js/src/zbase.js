class AcGame {
    constructor(id) {
        console.log("create ac game");
        this.id = id;
        this.$ac_game = $('#' + this.id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {

    }
}
