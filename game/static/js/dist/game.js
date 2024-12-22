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
                        设置
                    </div>
                </div>
            </div>
        `);
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
            console.log('click single mode');
            outer.hide();
            outer.root.playground.show();
        });

        this.$multi.click(function(){
            console.log('click multi mode');
        });

        this.$settings.click(function(){
            console.log('click settings');
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
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div>游戏界面</div>`)

        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    start() {

    }

    show() {
        //打开playground
        this.$playground.show();
    }

    hide() {
        //关闭playground
        this.$playground.hide();
    }
}class AcGame {
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
