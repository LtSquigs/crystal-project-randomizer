class CheatNan {

    constructor(options, mapIds) {
        let itemIds = [];
        this.goldenQuintar = false;
        if (options.quintarPass) itemIds.push(7);
        if (options.homePointStone) itemIds.push(19);
        if (options.quintarFlute) itemIds.push(39);
        if (options.salmonViolin) itemIds.push(48);
        if (options.owlDrum) itemIds.push(49);
        if (options.ibekBell) itemIds.push(50);
        if (options.salmonCello) itemIds.push(114);
        if (options.goldenQuintar) {
            // For the golden Quintar, we need to give the player the Quintar Codex,
            // the Quintar Ocarina, and an Incubator. You can't give a player the golden
            // quintar directly. So we have them hatch it.
            itemIds.push(115);
            itemIds.push(167);
            itemIds.push(201);
            this.goldenQuintar = true;
        }
        if (options.maps) {
            itemIds = itemIds.concat(mapIds);
        }

        this.itemIds = itemIds;
    }

    createItemCommands() {
        const itemActions = [];
        for(let itemId of this.itemIds) {
            itemActions.push(
                {
                    "ActionType": 8,
                    "Data": {
                        "LootType": 1,
                        "LootValue": itemId,
                        "Count": 1
                    }
                }
            )
        }

        return itemActions;
    }

    createGoldenQuintarCommands() {
        if (!this.goldenQuintar) return [];
        // These two commands are for quintar management.
        // The first one gives the player a golden quintar egg.
        // The second command opens the management prompt for them to hatch it.
        return [{
          "ActionType": 63,
          "Data": {
            "ActionType": 0,
            "QuintarType": 7,
            "QuintarNature": 3,
            "Slot": 0,
            "RaceTrack": 0
          }
        },
        {
          "ActionType": 63,
          "Data": {
            "ActionType": 1,
            "QuintarType": 0,
            "QuintarNature": 0,
            "Slot": 0,
            "RaceTrack": 0
          }
        }]
    }

    createCheatNan() {
        return {
            "ID": 99989, // Set this to a huge ID to not conflict with other entities
            "Coord": {   // This is just 2 coordinates over from the starting Nan
                "X": 3,
                "Y": 99,
                "Z": -1
            },
            "EntityType": 0,
            "Comments": null,
            "NpcData": {
                "Key": "Z1_CheatNan",
                "LinkedKey": null,
                "TieToSpawn": false,
                "UniquePerKey": false,
                "Outfits": [
                    {
                        "Condition": {
                            "ConditionType": 0,
                            "Data": null,
                            "IsNegation": false
                        },
                        "TextureKey": "Actor/Npc_Nan",
                        "Name": "Nan",
                        "PlayerCharacterLevel": null,
                        "Facing": 5,
                        "ShadowType": 2,
                        "AutoStep": false,
                        "VoxelID": null,
                        "VoxelVariantIndex": 0,
                        "PlayerCollision": 3,
                        "NpcCollision": 0,
                        "MountType": 15,
                        "JumpType": 0,
                        "KeepSpawned": false,
                        "WanderType": 0,
                        "WanderSpeed": 0,
                        "WanderFrequency": 0,
                        "WanderRadius": 0,
                        "WanderRoute": [],
                        "WanderRouteIsLine": false
                    }
                ],
                "Pages": [
                    {
                    "Condition": {
                        "ConditionType": 0,
                        "Data": null,
                        "IsNegation": false
                    },
                    "TriggerType": 0,
                    "TriggerProximityRadius": 0,
                    "TriggerProximityBox": {
                        "XNeg": 0,
                        "YNeg": 0,
                        "ZNeg": 0,
                        "XPos": 0,
                        "YPos": 0,
                        "ZPos": 0
                    },
                    "TriggerOnExitProximity": false,
                    "TriggerTouchType": 0,
                    "Actions": [
                        {
                            "ActionType": 3,
                            "Data": {
                                "Condition": {
                                    "ConditionType": 3,
                                    "Data": {
                                        "Scope": 0,
                                        "EntityKey": null,
                                        "VariableKey": "Obtained",
                                        "Eval": 0,
                                        "VariableType": 0,
                                        "Flag": false,
                                        "Number": 0,
                                        "SourceVariableScope": 0,
                                        "SourceVariableKey": null,
                                        "LootType": 0,
                                        "LootValue": 0
                                    },
                                    "IsNegation": false
                                },
                                "ConditionActionsTrue": [
                                    {
                                        "ActionType": 0,
                                        "Data": null
                                    },
                                    {
                                        "ActionType": 1,
                                        "Data": {
                                            "Message": "It's a secret to everybody...",
                                            "NpcKey": null,
                                            "Choices": [],
                                            "AnswerVariableKey": null,
                                            "ShowPartyStatus": false
                                        }
                                    },
                                    {
                                        "ActionType": 2,
                                        "Data": null
                                    }
                                ],
                                "ConditionActionsFalse": [ 
                                    {
                                        "ActionType": 0,
                                        "Data": null
                                    },
                                    {
                                        "ActionType": 1,
                                        "Data": {
                                        "Message": "It's a secret to everybody...",
                                        "NpcKey": null,
                                        "Choices": [],
                                        "AnswerVariableKey": null,
                                        "ShowPartyStatus": false
                                        }
                                    },
                                    ...this.createItemCommands(),
                                    ...this.createGoldenQuintarCommands(),
                                    {
                                        "ActionType": 6,
                                        "Data": {
                                        "Scope": 0,
                                        "EntityKey": null,
                                        "VariableKey": "Obtained",
                                        "VariableType": 0,
                                        "Flag": true,
                                        "Number": 0,
                                        "SourceVariableScope": 0,
                                        "SourceVariableKey": null,
                                        "LootType": 0,
                                        "LootValue": 0
                                        }
                                    },
                                    {
                                        "ActionType": 2,
                                        "Data": null
                                    },
                                ]
                            }
                        }
                    ],
                    "Context": 0
                    }
                ]
            },
            "SignData": null,
            "SparkData": null,
            "DoorData": null,
            "HomePointData": null,
            "TreasureData": null,
            "CrystalData": null,
            "MarkerData": null
        };
    }
};

module.exports = CheatNan;
