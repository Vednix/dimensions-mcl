import ClientPacketHandler from 'dimensions/extension/clientpackethandler';
import Client from 'dimensions/client';
import Packet from 'dimensions/packet';
import PacketTypes from 'dimensions/packettypes';
import PacketWriter from 'dimensions/packets/packetwriter';
import PacketReader from 'dimensions/packets/packetreader';
import MCL, { MAX_CLIENT_ID, MOBILE_SERVER_ID, PC_SERVER_ID } from './';
import BufferReader from 'dimensions/packets/bufferreader';
import BufferWriter from 'dimensions/packets/bufferwriter';

class PriorClientHandler extends ClientPacketHandler {
    protected _mcl: MCL;

    constructor(mcl: MCL) {
        super();
        this._mcl = mcl;
    }

    public handlePacket(client: Client, packet: Packet) {
        let handled = false;
        handled = this.handleIncompatiblePacket(client, packet);
        return handled;
    }

    private handleIncompatiblePacket(client: Client, packet: Packet) {
        let handled = false;
        if (!this._mcl.clients.has(client) && packet.packetType !== PacketTypes.ConnectRequest) {
            return false;
        }
        switch (packet.packetType) {
            case PacketTypes.ConnectRequest:
                handled = this.handleConnectRequest(client, packet);
                break;
            case PacketTypes.ChatMessage:
                handled = this.handleChatMessage(client, packet);
                break;
            case PacketTypes.PlayerDamage:
                handled = this.handlePlayerDamage(client, packet);
                break;
            case PacketTypes.KillMe:
                handled = this.handlePlayerKillMe(client, packet);
                break;
            case PacketTypes.AddPlayerBuff:
                handled = this.handleAddPlayerBuff(client, packet);
                break;
            case PacketTypes.PlayerZone:
                handled = this.handlePlayerZone(client, packet);
                break;
            case PacketTypes.UpdateItemOwner:
                this.handleUpdateItemOwner(client, packet);
                break;
            default:
                //console.log("PacketType not assigned =>", packet.packetType);
            break;
        }
        return handled;
    }

    private handleUpdateItemOwner(client, packet) {
        const reader = new PacketReader(packet.data);
        const itemId = reader.readInt16();
        const owner = reader.readByte();

        if (owner === MOBILE_SERVER_ID) {
            //packet.data.writeUInt8(PC_SERVER_ID, 2);
        }
    }

    private handleConnectRequest(client: Client, packet: Packet) {
        let reader = new PacketReader(packet.data);
        let version = reader.readString();
        // Mobile Version
        if (version === "Terraria155" || version === "Terraria156") {
            this._mcl.clients.add(client);
            packet.data = new PacketWriter()
                .setType(PacketTypes.ConnectRequest)
                .packString("Terraria194")
                .data;
            return false;
        }
        return false;
    }

    private handleChatMessage(client: Client, packet: Packet) {
        let reader = new PacketReader(packet.data);
        reader.readByte();
        reader.readByte();
        reader.readByte();
        reader.readByte();
        let message = reader.readString();
        packet.packetType = PacketTypes.LoadNetModule;
        packet.data = new PacketWriter()
            .setType(PacketTypes.LoadNetModule)
            .packUInt16(1)
            .packString("Say")
            .packString(message)
            .data;
        return false;
    }

    private handlePlayerDamage(client: Client, packet: Packet) {
        const reader = new PacketReader(packet.data);
        let playerId = reader.readByte();
        const hitDirection = reader.readByte();
        const damage = reader.readInt16();
        const message = reader.readString();
        const flags = reader.readByte();
        const realId = this._mcl.realId.get(client);
        if (playerId === MAX_CLIENT_ID && typeof realId !== "undefined") {
            playerId = realId;
        }

        packet.data = new PacketWriter()
            .setType(PacketTypes.PlayerHurtV2)
            .packByte(playerId)
            .packByte(128)
            .packString(message)
            .packInt16(damage)
            .packByte(hitDirection)
            .packByte(flags)
            .packSByte(0)
            .data;

        return false;
    }

    private handlePlayerKillMe(client: Client, packet: Packet) {
        const reader = new PacketReader(packet.data);
        let playerId = reader.readByte();
        const hitDirection = reader.readByte();
        const damage = reader.readInt16();
        const message = reader.readString();
        const flags = reader.readByte();
        const realId = this._mcl.realId.get(client);
        if (playerId === MAX_CLIENT_ID && typeof realId !== "undefined") {
            playerId = realId;
        }

        packet.data = new PacketWriter()
            .setType(PacketTypes.PlayerDeathV2)
            .packByte(playerId)
            .packByte(128)
            .packString(message)
            .packInt16(damage)
            .packByte(hitDirection)
            .packByte(flags)
            .data;

        return false;
    }

    private handleAddPlayerBuff(client: Client, packet: Packet) {
        const reader = new PacketReader(packet.data);
        let playerId = reader.readByte();
        const buff = reader.readByte();
        const time = reader.readInt16();
        const realId = this._mcl.realId.get(client);
        if (playerId === MAX_CLIENT_ID && typeof realId !== "undefined") {
            playerId = realId;
        }

        packet.data = new PacketWriter()
            .setType(PacketTypes.AddPlayerBuff)
            .packByte(playerId)
            .packByte(buff)
            .packInt32(time)
            .data;

        return false;
    }

    private handlePlayerZone(client: Client, packet: Packet) {
        const reader = new PacketReader(packet.data);
        const playerId = reader.readByte();
        const zone1 = reader.readByte();
        const zone2 = reader.readByte();

        packet.data = new PacketWriter()
            .setType(PacketTypes.PlayerZone)
            .packByte(playerId)
            .packByte(zone1)
            .packByte(zone2)
            .packByte(0)
            .packByte(0)
            .data;

        return false;
    }
}

export default PriorClientHandler;
