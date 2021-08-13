import Template from "./template";
import paper, { CompoundPath } from "paper";
import ComponentPort from "../core/componentPort";

export default class ThreeDMux extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            in: "Integer",
            out: "Integer",
            rotation: "Float",
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            width: "Float",
            length: "Float",
            valveSpacing: "Float",
            channelWidth: "Float",
            controlChannelWidth: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            in: 1,
            out: 8,
            rotation: 0,
            valveRadius: 1.2 * 1000,
            height: 0.8 * 1000,
            gap: 0.6 * 1000,
            width: 100,
            length: 100,
            valveSpacing: 0.6 * 1000,
            channelWidth: 500,
            controlChannelWidth: 0.6 * 1000
        };

        this.__units = {
            componentSpacing: "&mu;m",
            in: "",
            out: "",
            rotation: "&deg;",
            valveRadius: "&mu;m",
            height: "&mu;m",
            gap: "&mu;m",
            width: "&mu;m",
            length: "&mu;m",
            valveSpacing: "&mu;m",
            channelWidth: "&mu;m",
            controlChannelWidth: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            in: 1,
            out: 2,
            rotation: 0,
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            width: 100,
            length: 100,
            valveSpacing: 0.1 * 1000,
            channelWidth: 25,
            controlChannelWidth: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            in: 1,
            out: 128,
            rotation: 360,
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            width: 100,
            length: 100,
            valveSpacing: 0.1 * 10000,
            channelWidth: 25e3,
            controlChannelWidth: 1000
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            in: "in",
            out: "out",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap",
            width: "width",
            length: "length",
            valveSpacing: "valveSpacing",
            channelWidth: "channelWidth",
            controlChannelWidth: "controlChannelWidth"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            in: "in",
            out: "out",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap",
            width: "width",
            length: "length",
            valveSpacing: "valveSpacing",
            channelWidth: "channelWidth",
            controlChannelWidth: "controlChannelWidth"
        };

        this.__placementTool = "multilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CONTROL", "INVERSE"];

        this.__mint = "MUX3D";
    }

    render2D(params, key) {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CONTROL") {
            return this.__drawControl(params);
        }
    }

    render2DTarget(key, params) {
        const ret = new paper.CompoundPath();
        const flow = this.render2D(params, "FLOW");
        const control = this.render2D(params, "CONTROL");
        ret.addChild(control);
        ret.addChild(flow);
        ret.fillColor = params.color;
        ret.fillColor.alpha = 0.5;
        return ret;
    }

    getPorts(params) {
        const ins = params.in.value;
        const outs = params.out.value;
        let N;
        const channelWidth = params.channelWidth.value;
        let rotation = params.rotation.value;

        if (ins < outs) {
            N = outs;
        } else {
            N = ins;
            rotation += 180;
        }

        const horizontal_length = N * 4000;
        const vertical_length = N * 3000;
        const ports = [];

        for (var i = 0; i < N; i++) {
            const xpos = i * (horizontal_length / (N - 1));
            ports.push(new ComponentPort(xpos, 0, (i + 1).toString(), "FLOW"));
        }

        ports.push(new ComponentPort(horizontal_length / 2, vertical_length + N * 1000, (N + 1).toString(), "FLOW"));
        const bottomlinelength = N * 4000; // modify, so it depends on the input N
        const vertlinelength = N * 3000; // same as above

        const leftInput = -N * 1000;
        const rightInput = bottomlinelength + N * 1000;
        let indexN = N;
        const valvenum = Math.log(N) / Math.log(2);
        const vertholder = vertlinelength / (2 * valvenum);

        let count = N + 2;

        for (let i = 0; i < 2 * valvenum; i++) {
            // left side
            if (i % 2 === 0) {
                indexN /= 2;
                const cur_ind = N - indexN - 1;
                // let leftsideLeft = new paper.Point(leftInput, vertholder + (i) * vertlinelength/(2*valvenum + 2) - channelWidth/2);
                ports.push(new ComponentPort(leftInput, vertholder + (i * vertlinelength) / (2 * valvenum + 2), count.toString(), "CONTROL"));
                console.log(count);
                count++;
            }
            // right side
            else {
                ports.push(new ComponentPort(rightInput, vertholder + (i * vertlinelength) / (2 * valvenum + 2), count.toString(), "CONTROL"));
                console.log(count);
                count++;
            }
        }

        return ports;
    }

    __drawFlow(params) {
        const position = params.position;
        const gap = params.gap;
        const radius = params.valveRadius;
        const color = params.color;
        let rotation = params.rotation;
        const channelWidth = params.channelWidth;
        const threedmux_flow = new paper.CompoundPath();

        const px = position[0];
        const py = position[1];
        const ins = params.in;
        const outs = params.out;
        let N;
        if (ins < outs) {
            N = outs;
        } else {
            N = ins;
            rotation += 180;
        }
        const bottomlinelength = N * 4000; // modify, so it depends on the input N
        const vertlinelength = N * 3000; // same as above

        const bottomlineleft = new paper.Point(px, py - channelWidth / 2 + vertlinelength);
        const bottomlineright = new paper.Point(px + bottomlinelength, py + channelWidth / 2 + vertlinelength);
        const channel = new paper.Path.Rectangle(bottomlineleft, bottomlineright);

        threedmux_flow.addChild(channel);

        const valvenum = Math.log(N) / Math.log(2);
        const valveselect = vertlinelength / (2 * valvenum);
        const branchArray = new Array(N);
        const centerArray = new Array(N);

        // create base flow
        for (var i = 0; i < N; i++) {
            const xposbranch = i * (bottomlinelength / (N - 1));

            const vertlinebottom = new paper.Point(px + xposbranch - channelWidth / 2, py + vertlinelength);
            const vertlinetop = new paper.Point(px + xposbranch + channelWidth / 2, py);
            branchArray[i] = new paper.Path.Rectangle(vertlinebottom, vertlinetop);
        }

        // create output port
        const portCon = new paper.Point(px + bottomlinelength / 2 - channelWidth / 2, py + vertlinelength);
        const portOut = new paper.Point(px + bottomlinelength / 2 + channelWidth / 2, py + vertlinelength + N * 1000);

        const portRec = new paper.Path.Rectangle(portCon, portOut);

        threedmux_flow.addChild(portRec);

        // add valves and remove parts of channels
        let cur_N = N;
        const xpos = px;
        let ypos = py + valveselect;

        for (let j = 0; j < valvenum; j++) {
            // left side
            let count1 = 0;
            const increment1 = cur_N / 2;
            while (count1 < N) {
                for (var w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + ((count1 + w) * bottomlinelength) / (N - 1);

                    const cutrec = paper.Path.Rectangle({
                        from: new paper.Point(current_xpos - channelWidth / 2, ypos - gap / 2),
                        to: new paper.Point(current_xpos + channelWidth / 2, ypos + gap / 2)
                    });

                    this.__createthreedmuxValve(threedmux_flow, current_xpos, ypos, gap, radius, rotation, channelWidth);
                    branchArray[count1 + w] = branchArray[count1 + w].subtract(cutrec); // remove a portion from the selected channel
                }

                count1 += 2 * increment1;
            }

            // right side
            const ypos_adjust = vertlinelength / (2 * valvenum + 2);
            let count2 = 0;
            const increment2 = cur_N / 2;
            ypos += ypos_adjust;

            while (count2 < N) {
                for (let w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + bottomlinelength - ((count2 + w) * bottomlinelength) / (N - 1);

                    const cutrec = paper.Path.Rectangle({
                        from: new paper.Point(current_xpos - channelWidth / 2, ypos - gap / 2),
                        to: new paper.Point(current_xpos + channelWidth / 2, ypos + gap / 2)
                    });

                    branchArray[N - 1 - w - count2] = branchArray[N - 1 - w - count2].subtract(cutrec);
                    this.__createthreedmuxValve(threedmux_flow, current_xpos, ypos, gap, radius, rotation, channelWidth);
                }
                count2 += increment2 + cur_N / 2;
            }
            ypos += ypos_adjust;
            cur_N = cur_N / 2;
        }

        for (let i = 0; i < N; i++) {
            threedmux_flow.addChild(branchArray[i]);
            // threedmux_flow.addChild(centerArray[i]);
        }

        threedmux_flow.fillColor = color;

        threedmux_flow.rotate(rotation, new paper.Point(px, py));

        return threedmux_flow;
    }

    __createthreedmuxValve(compound_path, xpos, ypos, gap, radius, rotation, channel_width) {
        const center = new paper.Point(xpos, ypos);

        // Create the basic circle
        let circ = new paper.Path.Circle(center, radius);

        // Add the tiny channel pieces that jut out
        let rec = new paper.Path.Rectangle({
            point: new paper.Point(xpos - channel_width / 2, ypos - radius),
            size: [channel_width, radius],
            stokeWidth: 0
        });

        circ = circ.unite(rec);

        rec = new paper.Path.Rectangle({
            point: new paper.Point(xpos - channel_width / 2, ypos),
            size: [channel_width, radius],
            stokeWidth: 0
        });

        circ = circ.unite(rec);

        const cutout = paper.Path.Rectangle({
            from: new paper.Point(xpos - radius, ypos - gap / 2),
            to: new paper.Point(xpos + radius, ypos + gap / 2)
        });

        const valve = circ.subtract(cutout);

        compound_path.addChild(valve);
    }

    __drawControl(params) {
        const position = params.position;
        const radius = params.valveRadius;
        const color = params.color;
        let rotation = params.rotation;
        const channelWidth = params.controlChannelWidth;
        const threedmux_control = new paper.CompoundPath();

        const px = position[0];
        const py = position[1];

        const ins = params.in;
        const outs = params.out;

        let N;
        if (ins < outs) {
            N = outs;
        } else {
            N = ins;
            rotation += 180;
        }

        const bottomlinelength = N * 4000; // modify, so it depends on the input N
        const vertlinelength = N * 3000; // same as above

        const leftInput = px - N * 1000;
        const rightInput = px + bottomlinelength + N * 1000;
        let indexN = N;
        const valvenum = Math.log(N) / Math.log(2);
        const vertholder = vertlinelength / (2 * valvenum);
        const valveselect = vertlinelength / (2 * valvenum);

        for (let i = 0; i < 2 * valvenum; i++) {
            // left side
            if (i % 2 === 0) {
                indexN /= 2;
                const cur_ind = N - indexN - 1;
                const leftsideLeft = new paper.Point(leftInput, py + vertholder + (i * vertlinelength) / (2 * valvenum + 2) - channelWidth / 2);
                const leftsideRight = new paper.Point(px + cur_ind * (bottomlinelength / (N - 1)), py + vertholder + (i * vertlinelength) / (2 * valvenum + 2) + channelWidth / 2);
                const leftcontrol = new paper.Path.Rectangle(leftsideLeft, leftsideRight);

                threedmux_control.addChild(leftcontrol);
            }
            // right side
            else {
                const cur_ind = indexN;
                const rightsideLeft = new paper.Point(px + cur_ind * (bottomlinelength / (N - 1)), py + vertholder + (i * vertlinelength) / (2 * valvenum + 2) - channelWidth / 2);
                const rightsideRight = new paper.Point(rightInput, py + vertholder + (i * vertlinelength) / (2 * valvenum + 2) + channelWidth / 2);
                const rightcontrol = new paper.Path.Rectangle(rightsideLeft, rightsideRight);

                threedmux_control.addChild(rightcontrol);
            }
        }

        let cur_N = N;
        const xpos = px;
        let ypos = py + valveselect;

        for (let j = 0; j < valvenum; j++) {
            // left side
            let count1 = 0;
            const increment1 = cur_N / 2;
            while (count1 < N) {
                for (var w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + ((count1 + w) * bottomlinelength) / (N - 1);
                    const center = new paper.Point(current_xpos, ypos);
                    const circle = new paper.Path.Circle(center, radius);
                    threedmux_control.addChild(circle);
                }

                count1 += 2 * increment1;
            }

            // right side
            const ypos_adjust = vertlinelength / (2 * valvenum + 2);
            let count2 = 0;
            const increment2 = cur_N / 2;
            ypos += ypos_adjust;

            while (count2 < N) {
                for (let w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + bottomlinelength - ((count2 + w) * bottomlinelength) / (N - 1);
                    const center = new paper.Point(current_xpos, ypos);
                    const circle = new paper.Path.Circle(center, radius);
                    threedmux_control.addChild(circle);
                }
                count2 += increment2 + cur_N / 2;
            }
            ypos += ypos_adjust;
            cur_N = cur_N / 2;
        }

        threedmux_control.fillColor = color;
        threedmux_control.rotate(rotation, new paper.Point(px, py));

        return threedmux_control;
    }
}
