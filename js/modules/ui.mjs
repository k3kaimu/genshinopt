import * as Data from './data.mjs';
import * as Calc from './dmg-calc.mjs';


export function CharacterSelector(isList = false)
{
    this.selected = ko.observable();
    this.characters = Data.characters;
    this.elem = ko.observable();
    this.rarity = ko.observable();
    this.options = ko.pureComputed(function(){
        var list = [];
        var elem = this.elem();
        var rarity = this.rarity();
        

        this.characters.forEach(e => {
            if(!(elem == "ALL" || e.elem == elem))
                return;
            
            if(!(rarity == "ALL" || e.rarity == rarity))
                return;

            list.push(e);
        });

        return list;
    }, this);


    let selectedCharacter = this.selected;
    function CharacterSetting()
    {
        let viewModel;
        if(selectedCharacter() == undefined) {
            viewModel = new Data.CharacterViewModel(undefined);
        } else {
            viewModel = selectedCharacter().newViewModel();
        }

        this.viewModel = ko.observable(viewModel);
        this.selectedAttack = ko.observable();

        this.attackOptions = ko.pureComputed(function(){
            if(selectedCharacter() == undefined)
                return [];
            else
                return this.viewModel().presetAttacks();
        }, this);

        this.isValid = () => {
            return this.viewModel().parent != undefined && this.selectedAttack() != undefined;
        };

        this.toJS = () => {
            let obj = {};
            if(this.viewModel().parent) {
                obj.vm = this.viewModel().toJS();
            }

            if(this.selectedAttack()) {
                obj.attack = {
                    id: this.selectedAttack().id
                };
            }

            return obj;
        };

        this.fromJS = (obj) => {
            if(obj.vm) {
                this.viewModel().fromJS(obj.vm);
            }

            if(obj.attack) {
                this.attackOptions().forEach(e => {
                    if(e.id == obj.attack.id)
                        this.selectedAttack(e);
                });
            }
        };
    }

    this.settings = ko.observableArray();

    this.selected.subscribe(function(newCharacter){
        if(newCharacter == undefined) {
            // すべてのタブを削除する
            this.settings([]);
        } else {
            // すべてのタブを削除してデフォルト設定のみを残す
            this.settings([ new CharacterSetting() ]);
            this.selectLastOfExternalBuffList();
        }
    }.bind(this));

    this.selectLastOfExternalBuffList = function() {
        $(`#character_setting_list .nav-link`).removeClass("active");
        $(`#character_setting_list .tab-pane`).removeClass("active");

        let lastIndex = this.settings().length;
        $(`#character_setting_list ul li:nth-child(${lastIndex}) a`).tab('show');
    }.bind(this);

    this.addNewSetting = () => {
        this.settings.push(new CharacterSetting());
        this.selectLastOfExternalBuffList();
    };

    this.duplicate = (index) => {
        let srcObj = this.settings()[index].toJS();
        this.addNewSetting();
        let list = this.settings();
        let last = list[list.length - 1];
        last.fromJS(srcObj);
    };

    this.remove = (index) => {
        this.settings.remove(this.settings()[index]);
        this.selectLastOfExternalBuffList();
    };

    this.initialize = function() {
        // this.addNewSetting();
    }.bind(this);

    this.toJS = function() {
        let obj = {};

        obj.character_id = this.selected().id;
        obj.settings = this.settings().map(setting => {
            if(setting.isValid())
                return setting.toJS();
            else
                return undefined;
        }).filter(e => e);

        return obj;
    }.bind(this);

    this.fromJS = function(obj) {
        this.selected(Data.lookupCharacter(obj.character_id));
        this.settings([]);      // 最初に全部の設定を消す
        obj.settings.forEach(setting => {
            this.addNewSetting();
            let list = this.settings();
            let last = list[list.length - 1];
            last.fromJS(setting);
        });

        // this.selected(Data.lookupCharacter(obj.vm.parent_id));
        // if(isList) {
        //     let list = [];
        //     obj.vms.forEach(e => {
        //         let c = this.selected();
        //         let newVM = c.newViewModel();
        //         newVM.fromJS(e);
        //         list.push(newVM);
        //     });

        //     this.viewModelList(list);
        // } else {
        //     let charVM = this.viewModel();
        //     charVM.fromJS(obj.vm);
        //     this.viewModel(charVM);
        // }

        // this.attackOptions().forEach(e => {
        //     if(e.id == obj.attack.id)
        //         this.selectedAttack(e);
        // });
    }.bind(this);
}


export function WeaponSelector(selectedChar)
{
    this.weapons = Data.weapons;
    this.rarity = ko.observable();
    this.selected = ko.observable();
    this.options = ko.pureComputed(function(){
        var list = [];
        var rarity = this.rarity();
        var ch = selectedChar();

        this.weapons.forEach(e => {
            if(!(rarity == "ALL" || e.rarity == rarity))
                return;

            if(ch != undefined && ch.weaponType != e.weaponType)
                return;

            list.push(e);
        });

        return list;
    }, this);

    this.viewModel = ko.observable(new Data.WeaponViewModel());
    this.selected.subscribe(function(newWeaponData){
        if(newWeaponData == undefined) {
            this.viewModel(new Data.WeaponViewModel(undefined));
        } else {
            this.viewModel(newWeaponData.newViewModel());
        }
    }.bind(this));

    this.isValid = function() {
        return !(this.selected() == undefined);
    }.bind(this);

    this.toJS  = function() {
        let obj = {};
        obj.weapon = this.viewModel().toJS();
        return obj;
    }.bind(this);

    this.fromJS = function(obj) {
        this.selected(Data.lookupWeapon(obj.weapon.parent_id));
        this.viewModel().fromJS(obj.weapon);
    }.bind(this);
}


export function ArtifactSelector()
{
    this.artifacts = Data.artifacts;
    this.selected1 = ko.observable();
    this.selected2 = ko.observable();
    this.viewModel1 = ko.observable(new Data.ArtifactViewModel(undefined));
    this.viewModel2 = ko.observable(new Data.ArtifactViewModel(undefined));

    this.setViewModel = function(sel1, sel2, vm1, vm2){
        if(sel1.id == sel2.id) {
            vm1(sel1.newViewModel(4));
            vm2(new Data.ArtifactViewModel());
        } else {
            vm1(sel1.newViewModel(2));
            vm2(sel2.newViewModel(2));
        }
    }.bind(this);

    this.selected1.subscribe(function(newArt){
        let art2 = this.selected2();
        if(newArt == undefined) {
            this.viewModel1(new Data.ArtifactViewModel(undefined, 2));
            if(art2 != undefined)
                this.viewModel2(art2.newViewModel(2));

            return;
        }

        if(art2 != undefined)
            this.setViewModel(newArt, art2, this.viewModel1, this.viewModel2);
        else
            this.viewModel1(newArt.newViewModel(2));
    }.bind(this));

    this.selected2.subscribe(function(newArt){
        let art1 = this.selected1();
        if(newArt == undefined) {
            this.viewModel2(new Data.ArtifactViewModel(undefined, 2));
            if(art1 != undefined)
                this.viewModel1(art1.newViewModel(2));

            return;
        }

        if(art1 != undefined)
            this.setViewModel(art1, newArt, this.viewModel1, this.viewModel2);
        else
            this.viewModel2(newArt.newViewModel(2));
    }.bind(this));


    this.isValid = function() {
        return !(this.selected1() == undefined || this.selected2() == undefined);
    }.bind(this);


    this.toJS = function(){
        let obj = {};
        obj.art1 = this.viewModel1().toJS();

        if(this.viewModel2().parent)
            obj.art2 = this.viewModel2().toJS();

        return obj;
    }.bind(this);

    this.fromJS = function(obj){
        this.selected1(Data.lookupArtifact(obj.art1.parent_id));

        if(obj.art2 == undefined) {
            // art1と同じ
            this.selected2(Data.lookupArtifact(obj.art1.parent_id));
        } else {
            this.selected2(Data.lookupArtifact(obj.art2.parent_id));
        }

        let a1 = this.viewModel1();
        a1.fromJS(obj.art1);
        this.viewModel1(a1);

        if(!(obj.art2 == undefined)) {
            let a2 = this.viewModel2();
            a2.fromJS(obj.art2);
            this.viewModel2(a2);
        }
    }.bind(this);
}


export function ExternalBuffSetting()
{
    function BuffItem() {
        this.selected = ko.observable();
        this.viewModel = ko.observable(new Data.BufferEffectViewModel(undefined));

        this.selected.subscribe(function(newItem){
            if(newItem == undefined) {
                this.viewModel(new Data.BufferEffectViewModel(undefined));
            } else {
                this.viewModel(newItem.newViewModel());
            }
        }.bind(this));
    }


    this.buffEffects = Data.bufferEffects;
    this.selectedBuffList = ko.observableArray([new BuffItem()]);

    this.addBuff = function(){
        this.selectedBuffList.push(new BuffItem());
    }.bind(this);

    this.addAtk = ko.observable();
    this.rateAtk = ko.observable();
    this.addDef = ko.observable();
    this.rateDef = ko.observable();
    this.addHP = ko.observable();
    this.rateHP = ko.observable();
    this.crtRate = ko.observable();
    this.crtDmg = ko.observable();
    this.mastery = ko.observable();
    this.dmgBuff = ko.observable();
    this.recharge = ko.observable();
    this.resisDown = ko.observable();
    this.addIncDmg = ko.observable();

    this.applyDmgCalc = function(calc){
        Calc.VGData.pushContext('ExternalBuff');

        this.selectedBuffList().forEach(e => {
            let sel = e.selected();
            if(sel)
                calc = e.viewModel().applyDmgCalc(calc);
        });

        calc.addAtk.value += Number(this.addAtk() || 0);
        calc.rateAtk.value += Number(this.rateAtk() || 0);
        calc.addDef.value += Number(this.addDef() || 0);
        calc.rateDef.value += Number(this.rateDef() || 0);
        calc.addHP.value += Number(this.addHP() || 0);
        calc.rateHP.value += Number(this.rateHP() || 0);
        calc.baseCrtRate.value += Number(this.crtRate() || 0);
        calc.baseCrtDmg.value += Number(this.crtDmg() || 0);
        calc.baseMastery.value += Number(this.mastery() || 0);
        calc.baseAllDmg.value += Number(this.dmgBuff() || 0);
        calc.baseRecharge.value += Number(this.recharge() || 0);
        calc.baseAllResis.value -= Number(this.resisDown() || 0);
        // calc.addIncreaseDmg.value += Number(this.addIncDmg() || 0);

        let addDmgValue = Number(this.addIncDmg() || 0);
        let ctx = Calc.VGData.context;
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dExBuffAddIncDmg = addDmgValue;

            increaseDamage(attackProps) {
                return super.increaseDamage(attackProps).add(Calc.VGData.constant(this.#dExBuffAddIncDmg).as(ctx));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        Calc.VGData.popContext();

        return calc;
    }.bind(this);

    this.textInputCSS = function(value) {
        if(isValidNumber(value) && value != 0)
            return "text-success";
        else if(!isValidNumber(value) && value != undefined)
            return "text-danger";
        else
            return "";
    }.bind(this);

    this.isValid = () => true;

    this.toJS = function(){
        let obj = {};

        obj.buffItems = this.selectedBuffList().map(e => {
            if(e.selected())
                return e.viewModel().toJS();
            else
                return undefined;
        }).filter(e => !!e);
        obj.addAtk = this.addAtk();
        obj.rateAtk = this.rateAtk();
        obj.addDef = this.addDef();
        obj.rateDef = this.rateDef();
        obj.addHP = this.addHP();
        obj.rateHP = this.rateHP();
        obj.crtRate = this.crtRate();
        obj.crtDmg = this.crtDmg();
        obj.mastery = this.mastery();
        obj.dmgBuff = this.dmgBuff();
        obj.recharge = this.recharge();
        obj.resisDown = this.resisDown();
        obj.addIncDmg = this.addIncDmg();
        return obj;
    }.bind(this);

    this.fromJS = function(obj) {
        this.selectedBuffList([]);
        obj.buffItems.forEach(e => {
            let newItem = new BuffItem();
            newItem.selected(Data.lookupBuffEffect(e.parent_id));
            newItem.viewModel().fromJS(e);
            this.selectedBuffList.push(newItem);
        });
        if(this.selectedBuffList().length == 0) {
            this.selectedBuffList.push(new BuffItem());
        }

        this.addAtk(obj.addAtk);
        this.rateAtk(obj.rateAtk);
        this.addDef(obj.addDef);
        this.rateDef(obj.rateDef);
        this.addHP(obj.addHP);
        this.rateHP(obj.rateHP);
        this.crtRate(obj.crtRate);
        this.crtDmg(obj.crtDmg);
        this.mastery(obj.mastery);
        this.dmgBuff(obj.dmgBuff);
        this.recharge(obj.recharge);
        this.resisDown(obj.resisDown);
        this.addIncDmg(obj.addIncDmg);
    }.bind(this);
}


export class CharacterPicker
{
    constructor()
    {
        this.selected = ko.observable();
        this.characters = Data.characters;
        this.elem = ko.observable();
        this.rarity = ko.observable();
        this.options = ko.pureComputed(function(){
            var list = [];
            var elem = this.elem();
            var rarity = this.rarity();
            

            this.characters.forEach(e => {
                if(!(elem == "ALL" || e.elem == elem))
                    return;
                
                if(!(rarity == "ALL" || e.rarity == rarity))
                    return;

                list.push(e);
            });

            return list;
        }, this);
    }


    isValid() {
        return this.selected() != undefined;
    }


    toJS() {
        return {id: this.selected().id};
    }


    fromJS(obj) {
        if(obj.id) {
            this.selected(Data.lookupCharacter(obj.id));
        }
    }
}


export class CharacterVMSetting
{
    constructor(selectedCharacterKO)
    {
        this.selected = selectedCharacterKO;
        this.viewModel = ko.pureComputed(function(){
            let char = this.selected();
            if(char == undefined)
                return new Data.CharacterViewModel(undefined);
            else
                return char.newViewModel();
        }, this);
    }


    isValid() {
        return this.viewModel().parent != undefined;
    }


    applyDmgCalc(calc)
    {
        return this.viewModel().applyDmgCalc(calc);
    }


    toJS() {
        return this.viewModel().toJS();
    }


    fromJS(obj) {
        this.viewModel().fromJS(obj);
    }
}


export class AttackSetting
{
    constructor(characterVMKOs = [])
    {
        if(ko.isObservable(characterVMKOs))
            this.characterVMs = characterVMKOs;
        else
            this.characterVMs = ko.observableArray(characterVMKOs);

        this.selectedAttackId = ko.observable();
        this.selectedAttackId.subscribe(newVal => {
            if(newVal == undefined) {
                this.compoundedList([]);
                this.addCompoundedItem();
            }
        });

        this.compoundedList = ko.observableArray([]);
        this.addCompoundedItem();   // 初期値
    }


    // 全characterVMsのpresetAttacksで積集合を取る
    // idとlabelのリストを返す
    getAllOptions(addCompounded = true) {
        let cvms = this.characterVMs();
        if(cvms.filter(e => e.parent != undefined).length == 0)
            return [];

        let idCount = {};
        let labels = {};
        cvms.forEach(cvm => {
            if(cvm.parent == undefined) return;

            cvm.presetAttacks().forEach(e => {
                if(e.id in idCount)
                    idCount[e.id] += 1;
                else
                    idCount[e.id] = 1;

                labels[e.id] = e.label;
            });
        });

        let ret = [];
        let keys = Object.keys(idCount);
        keys.forEach(k => {
            if(idCount[k] == cvms.length)
                ret.push({id: k, label: labels[k]});
        });

        if(addCompounded && ret.length >= 1) {
            ret.push({id: '__compounded_by_UI__', label: '複合組合せ設定（攻撃方法と倍率の指定）'});
        }

        return ret;
    }


    isValid()
    {
        let ok = true;
        ok = ok && this.selectedAttackId() != undefined;

        if(this.selectedAttackId() == '__compounded_by_UI__') {
            let cnt = 0;
            this.compoundedList().forEach(e => {
                let valid = true;
                valid = valid && e.selectedAttackId() != undefined;
                valid = valid && isValidNumber(e.scale());
                if(valid)
                    cnt += 1;
            });

            ok = ok && cnt > 0;
        }

        return ok;
    }


    addCompoundedItem() {
        this.compoundedList.push({
            selectedAttackId: ko.observable(),
            scale: ko.observable(1),
        });
    }


    removeCompoundedItem(index) {
        this.compoundedList.remove(this.compoundedList()[index]);
    }


    makeAttackEvaluator(cvm) {
        let attackId = this.selectedAttackId();
        if(attackId == '__compounded_by_UI__') {
            let attackList = this.compoundedList().map(e => {
                if(e.selectedAttackId() == undefined)
                    return undefined;
                else
                    return {id: e.selectedAttackId(), scale: Number(e.scale()) };
            }).filter(e => e);

            return new CompoundedAttackEvaluator(cvm, attackList);
        } else {
            // attackIdに一致するものを探す
            let ret = undefined;
            cvm.presetAttacks().forEach(e => {
                if(e.id == attackId)
                    ret = e;
            });

            return ret;
        }
    }


    textInputCSS(value) {
        if(!(isValidNumber(value) && value != 0))
            return "border-danger";
        else
            return undefined;
    }


    
    toJS() {
        let obj = {};
        obj.id = this.selectedAttackId();
        if(obj.id == '__compounded_by_UI__') {
            obj.clist = this.compoundedList().map(e => {
                return {id: e.selectedAttackId(), scale: e.scale()};
            });
        }

        return obj;
    }


    fromJS(obj) {
        this.selectedAttackId(obj.id);

        if(obj.id == '__compounded_by_UI__') {
            this.compoundedList([]);
            obj.clist.forEach(e =>  {
                this.compoundedList.push({
                    selectedAttackId: ko.observable(e.id),
                    scale: ko.observable(e.scale),
                });
            });
        }
    }
}


export class CompoundedAttackEvaluator extends Data.AttackEvaluator
{
    constructor(cvm, id_and_scales)
    {
        super("__compounded_by_UI__", "複合組合せ設定（攻撃方法と倍率の指定）");

        let presets = cvm.presetAttacks();
        this.attackEvals = [];
        this.scales = [];
        id_and_scales.forEach(e => {
            presets.forEach(aeval => {
                if(aeval.id == e.id) {
                    this.attackEvals.push(aeval);
                    this.scales.push(Number(e.scale));
                }
            });
        });
    }


    evaluate(calc, additionalProps = {}) {
        let dmg = Calc.VGData.zero();
        this.attackEvals.forEach((aeval, i) => {
            dmg = dmg.add(aeval.evaluate(calc, {...additionalProps}).mul(this.scales[i]));
        });

        return dmg;
    }
}


export class BundleSetting
{
    constructor(enableCharacterPicker, selectedCharacterKO = undefined, enableCharacter, enableAttack, enableWeapon, enableArtifact, enableExBuff)
    {
        this.enableCharacterPicker = ko.isObservable(enableCharacterPicker) ? enableCharacterPicker : ko.observable(enableCharacterPicker);
        this.enableCharacter = ko.isObservable(enableCharacter) ? enableCharacter : ko.observable(enableCharacter);
        this.enableAttack = ko.isObservable(enableAttack) ? enableAttack : ko.observable(enableAttack);
        this.enableWeapon = ko.isObservable(enableWeapon) ? enableWeapon : ko.observable(enableWeapon);
        this.enableArtifact = ko.isObservable(enableArtifact) ? enableArtifact : ko.observable(enableArtifact);
        this.enableExBuff = ko.isObservable(enableExBuff) ? enableExBuff : ko.observable(enableExBuff);

        if(enableCharacterPicker)
            this.characterPicker = new CharacterPicker();

        this.characterVMSetting = new CharacterVMSetting(selectedCharacterKO ?? this.characterPicker.selected);
        this.attackSetting = new AttackSetting(ko.pureComputed(function(){
            return [this.characterVMSetting.viewModel()];
        }, this));

        this.weaponSelector = new WeaponSelector(selectedCharacterKO ?? this.characterPicker.selected);
        this.artifactSelector = new ArtifactSelector();
        this.exbuffSetting = new ExternalBuffSetting();
    }


    isValid()
    {
        let ret = true;
        ret = ret && (!this.enableCharacterPicker() || this.characterPicker.isValid());
        ret = ret && (!this.enableCharacter() || this.characterVMSetting.isValid());
        ret = ret && (!this.enableAttack()   || this.attackSetting.isValid());
        ret = ret && (!this.enableWeapon()   || this.weaponSelector.isValid());
        ret = ret && (!this.enableArtifact() || this.artifactSelector.isValid());
        ret = ret && (!this.enableExBuff()   || this.exbuffSetting.isValid());
        return ret;
    }


    applyDmgCalc(calc)
    {
        if(this.enableCharacter()) {
            calc = this.characterVMSetting.applyDmgCalc(calc);
        }

        if(this.enableWeapon()) {
            calc = this.weaponSelector.applyDmgCalc(calc);
        }

        if(this.enableArtifact()) {
            calc = this.artifactSelector.applyDmgCalc(calc);
        }

        if(this.enableExBuff()) {
            calc = this.exbuffSetting.applyDmgCalc(calc);
        }

        return calc;
    }


    toJS()
    {
        let obj = {};
        if(this.enableCharacterPicker())    obj.chaPck = this.characterPicker.toJS();
        if(this.enableCharacter())          obj.cvmStg = this.characterVMSetting.toJS();
        if(this.enableAttack())             obj.attack = this.attackSetting.toJS();
        if(this.enableWeapon())             obj.wvmStg = this.weaponSelector.toJS();
        if(this.enableArtifact())           obj.avmStg = this.artifactSelector.toJS();
        if(this.enableExBuff())             obj.exbStg = this.exbuffSetting.toJS();
        return obj;
    }


    fromJS(obj)
    {
        if(obj.chaPck) {
            this.enableCharacterPicker(true);
            this.characterPicker.fromJS(obj.chaPck);
        } else {
            this.enableCharacterPicker(false);
        }

        if(obj.cvmStg) {
            this.enableCharacter(true);
            this.characterVMSetting.fromJS(obj.cvmStg);
        } else {
            this.enableCharacter(false);
        }

        if(obj.attack) {
            this.enableAttack(true);
            this.attackSetting.fromJS(obj.attack);
        } else {
            this.enableAttack(false);
        }

        if(obj.wvmStg) {
            this.enableWeapon(true);
            this.weaponSelector.fromJS(obj.wvmStg);
        } else {
            this.enableWeapon(false);
        }

        if(obj.avmStg) {
            this.enableArtifact(true);
            this.artifactSelector.fromJS(obj.avmStg);
        } else {
            this.enableArtifact(false);
        }

        if(obj.exbStg) {
            this.enableExBuff(true);
            this.exbuffSetting.fromJS(obj.exbStg);
        } else {
            this.enableExBuff(false);
        }
    }
}


export class TabListViewModel
{
    constructor(htmlId)
    {
        this.htmlId = htmlId;
        this.list = ko.observableArray();
    }


    selectListItem(idx) {
        $(`#${this.htmlId} .nav-link`).removeClass("active");
        $(`#${this.htmlId} .tab-pane`).removeClass("active");
        $(`#${this.htmlId} ul li:nth-child(${idx+1}) a`).tab('show');
    }


    addListItem() {}

    dupListItem(idx) {
        let obj = this.list()[idx].toJS();
        this.addListItem();
        
        let arr = this.list();
        arr[arr.length - 1].fromJS(obj);
        this.selectListItem(arr.length - 1);
    }

    removeListItem(idx) {
        this.list.remove(this.list()[idx]);
        this.selectListItem(this.list().length - 1);
    }


    toJS() {
        let arr = [];
        this.list().forEach(e => {
            if(e.isValid())
                arr.push(e.toJS());
        });

        return arr;
    }


    fromJS(arr) {
        this.list([]);
        arr.forEach((e, i) => {
            this.addListItem();
            this.list()[i].fromJS(e);
        });
    }
}
