import { html, Component, render } from '../../node_modules/htm/preact/standalone.module.js';

class App extends Component {
    constructor() {
        super();

        this.state = { time: 0, randomizerState: { loading: false, text: ""} };
    }

    update() {
        this.setState({ time: Date.now(), randomizerState: this.state.randomizerState })
    }

    randomize(settings, seed) {
        return async () => {
            console.log('Starting Randomization')
            this.setState({ time: this.state.time, randomizerState: { loading: true, text: "Randomizing Game..." }})
            const error = await window.Randomizer.randomize(settings, seed);
            if (error) {
                this.setState({ time: this.state.time, randomizerState: { loading: false, text: error }})
            } else {
                this.setState({ time: this.state.time, randomizerState: { loading: false, text: "Finished Randomizing" }})
            }
            console.log('Finished Randomization')
        }
    }

    getNewSeed = () => {
        window.Randomizer.getNewSeed();
        this.update();
    }

    updateSeed = (e) => {
        window.Randomizer.changeSeed(e.target.value);
        this.update();
    }

    updateOption = (optionKey) => {
        return (e) => {
            let value = 0;
            if(e.target.type === 'checkbox') {
                value = e.target.checked;
            } else if (e.target.type === 'number') {
                value = parseInt(e.target.value);
            } else {
                value = e.target.value;
            }

            window.Randomizer.updateSettings(optionKey, value);
            this.update()
        }
    }

    updateJobPool = (jobId) => {
        return (e) => {
            window.Randomizer.updateJobPool(jobId, e.target.checked);
            this.update();
        }
    }

    checkJobPool = (jobId, settings) => {
        return settings.jobOptions.customJobPool.indexOf(jobId) !== -1;
    }

    copyToClipboard = (str) => {
        return (e) => {
            navigator.clipboard.writeText(str);
        };
    }

    updateSettingFromString = (e) => {
        window.Randomizer.updateSettingsFull(this.decodeSettings(e.target.value));
        this.update();
    }

    encodeSettings = (settings) => {
        return btoa(JSON.stringify(settings));
    }

    decodeSettings = (settings) => {
        return JSON.parse(atob(settings));
    }

    render() {
        const settings = window.Randomizer.getSettings();
        const seed = window.Randomizer.getSeed();
        console.log(settings);
        return html`
        <div>
            <h5 class="display-6">Crystal Project Randomizer</h6>
            <h5 class="display-7">Job Swap Settings</h7>
            <p><small>If enabled this will swap which crystals give which jobs, as well as what jobs you start with. Starting Jobs determines how many jobs you start with unlocked (between 1-6) and Crystal Jobs determines how many jobs the crystals can give you (between 0-18)</small></p>
            <p><small>The Job Pool options allows you to restrict what jobs can be assinged to the player. If none are selected than all jobs will be available.</small></p>

            <div class="row g-3">
                <div class="col-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="enableJobSwapping" onClick=${this.updateOption('jobOptions.enable')} checked=${settings.jobOptions.enable} />
                            <label class="form-check-label" for="enableJobSwapping">Enable Job Shuffling</label>
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <label for="startingJobs" class="form-label">Starting Jobs</label>
                                <input type="number" class="form-control" id="startingJobs" min=1 max=6 onInput=${this.updateOption('jobOptions.startingJobs')} value=${settings.jobOptions.startingJobs}/>
                            </div>
                            <div class="col-6">
                                <label for="crystalJobs" class="form-label">Crystal Jobs</label>
                                <input type="number" class="form-control" id="crystalJobs" min=0 max=18 onInput=${this.updateOption('jobOptions.crystalJobs')} value=${settings.jobOptions.crystalJobs}/>
                            </div>
                        </div>
                </div>
                <div class="col-9">
                    <label for="inputPassword4" class="form-label">Job Pool</label><br/>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool0" onClick=${this.updateJobPool(0)} checked=${this.checkJobPool(0, settings)} />
                        <label class="form-check-label" for="jobPool0">Warrior</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool1" onClick=${this.updateJobPool(1)} checked=${this.checkJobPool(1, settings)} />
                        <label class="form-check-label" for="jobPool1">Fencer</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool2" onClick=${this.updateJobPool(2)} checked=${this.checkJobPool(2, settings)} />
                        <label class="form-check-label" for="jobPool2">Rogue</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool3" onClick=${this.updateJobPool(3)} checked=${this.checkJobPool(3, settings)} />
                        <label class="form-check-label" for="jobPool3">Wizard</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool4" onClick=${this.updateJobPool(4)} checked=${this.checkJobPool(4, settings)} />
                        <label class="form-check-label" for="jobPool4">Cleric</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool5" onClick=${this.updateJobPool(5)} checked=${this.checkJobPool(5, settings)} />
                        <label class="form-check-label" for="jobPool5">Monk</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool6" onClick=${this.updateJobPool(6)} checked=${this.checkJobPool(6, settings)} />
                        <label class="form-check-label" for="jobPool6">Reaper</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool7" onClick=${this.updateJobPool(7)} checked=${this.checkJobPool(7, settings)} />
                        <label class="form-check-label" for="jobPool7">Hunter</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool8" onClick=${this.updateJobPool(8)} checked=${this.checkJobPool(8, settings)} />
                        <label class="form-check-label" for="jobPool8">Shaman</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool9" onClick=${this.updateJobPool(9)} checked=${this.checkJobPool(9, settings)} />
                        <label class="form-check-label" for="jobPool9">Beatsmith</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool10" onClick=${this.updateJobPool(10)} checked=${this.checkJobPool(10, settings)} />
                        <label class="form-check-label" for="jobPool10">Aegis</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool11" onClick=${this.updateJobPool(11)} checked=${this.checkJobPool(11, settings)} />
                        <label class="form-check-label" for="jobPool11">Dervish</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool12" onClick=${this.updateJobPool(12)} checked=${this.checkJobPool(12, settings)} />
                        <label class="form-check-label" for="jobPool12">Nomad</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool13" onClick=${this.updateJobPool(13)} checked=${this.checkJobPool(13, settings)} />
                        <label class="form-check-label" for="jobPool13">Scholar</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool14" onClick=${this.updateJobPool(14)} checked=${this.checkJobPool(14, settings)} />
                        <label class="form-check-label" for="jobPool14">Warlock</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool15" onClick=${this.updateJobPool(15)} checked=${this.checkJobPool(15, settings)} />
                        <label class="form-check-label" for="jobPool15">Valkyrie</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool16" onClick=${this.updateJobPool(16)} checked=${this.checkJobPool(16, settings)} />
                        <label class="form-check-label" for="jobPool16">Weaver</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool17" onClick=${this.updateJobPool(17)} checked=${this.checkJobPool(17, settings)} />
                        <label class="form-check-label" for="jobPool17">Chemist</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool18" onClick=${this.updateJobPool(18)} checked=${this.checkJobPool(18, settings)} />
                        <label class="form-check-label" for="jobPool18">Ninja</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool19" onClick=${this.updateJobPool(19)} checked=${this.checkJobPool(19, settings)} />
                        <label class="form-check-label" for="jobPool19">Assassin</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool20" onClick=${this.updateJobPool(20)} checked=${this.checkJobPool(20, settings)} />
                        <label class="form-check-label" for="jobPool20">Samurai</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool21" onClick=${this.updateJobPool(21)} checked=${this.checkJobPool(21, settings)} />
                        <label class="form-check-label" for="jobPool21">Summoner</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool22" onClick=${this.updateJobPool(22)} checked=${this.checkJobPool(22, settings)} />
                        <label class="form-check-label" for="jobPool22">Mimic</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="jobPool23" onClick=${this.updateJobPool(23)} checked=${this.checkJobPool(23, settings)} />
                        <label class="form-check-label" for="jobPool23">Beastmaster</label>
                    </div>      
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h5 class="display-7">Item Shuffle Settings</h7>
                    <p><small>If enabled, items will be swapped and interchanged between all the listed item pools.</small></p>
                    <p><small>Shop Swap does not include Lost + Found or Craft Shops. Major NPC Items = Mounts and a few Passes. Minor NPC Items = Anything else.</small></p>
                    <div class="row">
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="includeTreasures" onInput=${this.updateOption('itemOptions.includeTreasures')} checked=${settings.itemOptions.includeTreasures}/>
                                <label class="form-check-label" for="includeTreasures">Shuffle Treasure Chests (535 items)</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="includeShops" onInput=${this.updateOption('itemOptions.includeShops')} checked=${settings.itemOptions.includeShops}/>
                                <label class="form-check-label" for="includeShops">Shuffle Shop Inventories (282 items)</label>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="includeMajorNpcItems" onInput=${this.updateOption('itemOptions.includeMajorNpcItems')} checked=${settings.itemOptions.includeMajorNpcItems}/>
                                <label class="form-check-label" for="includeMajorNpcItems">Shuffle Major NPC Items (18 items)</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="includeOres" onInput=${this.updateOption('itemOptions.includeOres')} checked=${settings.itemOptions.includeOres}/>
                                <label class="form-check-label" for="includeOres">Shuffle Ores (165 items)</label>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="includeMasterySeals" onInput=${this.updateOption('itemOptions.includeMasterySeals')} checked=${settings.itemOptions.includeMasterySeals}/>
                                <label class="form-check-label" for="includeMasterySeals">Shuffle Mastery Seals (24 items)</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="includeMinorNpcItems" onInput=${this.updateOption('itemOptions.includeMinorNpcItems')} checked=${settings.itemOptions.includeMinorNpcItems}/>
                                <label class="form-check-label" for="includeMinorNpcItems">Shuffle Minor NPC Items (146 items)</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12 mt-3">
                    <h5 class="display-7">Monster Shuffle Settings</h7>
                    <p><small>Shuffles Monsters to any other monster on the map. Key Quintars are the Brutish and Fancy Quintars required to get the Quintar Pass</small></p>
                    <div class="row">
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="swapMonsters" onInput=${this.updateOption('monsterOptions.swapMonsters')} checked=${settings.monsterOptions.swapMonsters}/>
                                <label class="form-check-label" for="swapMonsters">Shuffle Monsters</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="includeUniques" onInput=${this.updateOption('monsterOptions.includeUniques')} checked=${settings.monsterOptions.includeUniques}/>
                                <label class="form-check-label" for="includeUniques">Include Unique Monsters</label>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="includeKeyQuintars" onInput=${this.updateOption('monsterOptions.includeKeyQuintars')} checked=${settings.monsterOptions.includeKeyQuintars}/>
                                <label class="form-check-label" for="includeKeyQuintars">Include Key Quintars</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="shuffleMonsterDrops" onInput=${this.updateOption('monsterOptions.shuffleMonsterDrops')} checked=${settings.monsterOptions.shuffleMonsterDrops}/>
                                <label class="form-check-label" for="shuffleMonsterDrops">Shuffle Monster Drops</label>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="shuffleMonsterSteals" onInput=${this.updateOption('monsterOptions.shuffleMonsterSteals')} checked=${settings.monsterOptions.shuffleMonsterSteals}/>
                                <label class="form-check-label" for="shuffleMonsterSteals">Shuffle Monster Steals</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h5 class="display-7">Crystal Shuffle Settings</h7>
                    <p><small>This option will move the crystals between the 18 original positions and 18 new positions that are custom to the randomizer.</small></p>
                    <div class="">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="shuffleCrystals" onInput=${this.updateOption('crystalOptions.enable')} checked=${settings.crystalOptions.enable}/>
                            <label class="form-check-label" for="shuffleCrystals">Shuffle Crystals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="includeOriginalLocations" onInput=${this.updateOption('crystalOptions.includeOriginalLocations')} checked=${settings.crystalOptions.includeOriginalLocations}/>
                            <label class="form-check-label" for="includeOriginalLocations">Include Original Locations</label>
                        </div>
                    </div>
                </div>
                <div class="col-12 mt-3">
                    <h5 class="display-7">Cheat Nan Options</h7>
                    <p><small>Enabling any of these options will create a Nan NPC at the start of the game that gives you the selected items. These items are not removed from the shuffled item pool.</small></p>
                    <div class="row">
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="quintarPass" onInput=${this.updateOption('cheatNanOptions.quintarPass')} checked=${settings.cheatNanOptions.quintarPass}/>
                                <label class="form-check-label" for="quintarPass">Quintar Pass</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="homePointStone" onInput=${this.updateOption('cheatNanOptions.homePointStone')} checked=${settings.cheatNanOptions.homePointStone}/>
                                <label class="form-check-label" for="homePointStone">Home Point Stone</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="quintarFlute" onInput=${this.updateOption('cheatNanOptions.quintarFlute')} checked=${settings.cheatNanOptions.quintarFlute}/>
                                <label class="form-check-label" for="quintarFlute">Quintar Flute</label>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="salmonViolin" onInput=${this.updateOption('cheatNanOptions.salmonViolin')} checked=${settings.cheatNanOptions.salmonViolin}/>
                                <label class="form-check-label" for="salmonViolin">Salmon Violin</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="owlDrum" onInput=${this.updateOption('cheatNanOptions.owlDrum')} checked=${settings.cheatNanOptions.owlDrum}/>
                                <label class="form-check-label" for="owlDrum">Owl Drum</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="ibekBell" onInput=${this.updateOption('cheatNanOptions.ibekBell')} checked=${settings.cheatNanOptions.ibekBell}/>
                                <label class="form-check-label" for="ibekBell">Ibek Bell</label>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="salmonCello" onInput=${this.updateOption('cheatNanOptions.salmonCello')} checked=${settings.cheatNanOptions.salmonCello}/>
                                <label class="form-check-label" for="salmonCello">Salmon Cello</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="goldenQuintar" onInput=${this.updateOption('cheatNanOptions.goldenQuintar')} checked=${settings.cheatNanOptions.goldenQuintar}/>
                                <label class="form-check-label" for="goldenQuintar">Golen Quintar</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="maps" onInput=${this.updateOption('cheatNanOptions.maps')} checked=${settings.cheatNanOptions.maps}/>
                                <label class="form-check-label" for="maps">Maps</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <h5 class="display-7">Settings</h7>
                <p><small>Seed determines the randomness of the randomizer. Same Seed = Same Results. Config String lets you load a premade config.</small></p>
                <p><small>Paste into these fields to update them automatically</small></p>
                <div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="inputGroup-sizing-sm">Seed</span>
                    </div>
                    <input type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm"  value=${seed} onInput=${this.updateSeed}/>
                    <button onClick=${this.getNewSeed} class="btn btn-primary">Get New Seed</button>
                </div>
                <div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="inputGroup-sizing-sm">Config String</span>
                    </div>
                    <input type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm"  value=${this.encodeSettings(settings)} onInput=${this.updateSettingFromString} />
                    <button onClick=${this.copyToClipboard(this.encodeSettings(settings))} class="btn btn-primary">Copy To Clipboard</button>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-3">
                    <button onClick=${this.randomize(settings, seed)} class="btn btn-primary randomize-button">Randomize Game</button>
                </div>
                <div class="col-9  d-flex align-items-center">
                    ${
                        this.state.randomizerState.loading ? 
                        html`
                        <div class="spinner-border me-2" role="status">
                        </div>
                        ` : null
                    }
                    <div>${this.state.randomizerState.text}</div>
                </div>
            </div>
        </div>`;
    }
}

render(html`<${App} />`, document.body);
