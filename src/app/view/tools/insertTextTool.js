import MouseTool from './mouseTool'
import Device from '@/app/core/device'
import Registry from '../../core/registry'
import SimpleQueue from '../../utils/simpleQueue'

import paper from 'paper'
import PositionTool from './positionTool'
import Params from '../../core/params'
import { ComponentAPI } from '@/componentAPI'

export default class InsertTextTool extends MouseTool {
  constructor (viewManagerDelegate) {
    super()
    this.typeString = 'TEXT'
    this.setString = 'Standard'
    this.currentFeatureID = null
    const ref = this
    this.lastPoint = null
    this._text = 'TESTING-TEXT'
    this.fontSize = 12
    this.viewManagerDelegate = viewManagerDelegate
    this.showQueue = new SimpleQueue(
      function () {
        ref.showTarget()
      },
      20,
      false
    )
    this.up = function (event) {
      // do nothing
    }
    this.move = function (event) {
      ref.lastPoint = MouseTool.getEventPosition(event)
      ref.showQueue.run()
    }
    this.down = function (event) {
      Registry.viewManager.killParamsWindow()
      paper.project.deselectAll()
      // TODO - Add the ability to insert a non physical text element later on using Liam's Nonphysical compoennt API
      ref.createNewFeature(MouseTool.getEventPosition(event))
    }
  }

  /**
     * Creates a physical test feature when using the InsertTextTool
     */
  createNewFeature (point) {
    const fixedpoint = PositionTool.getTarget(point)
    const newFeature = Device.makeFeature(
      'Text',
      {
        position: fixedpoint,
        height: 200,
        text: this._text,
        fontSize: this.fontSize * 10000
      },
      'TEXT_' + this._text,
      ComponentAPI.generateID(),
      'XY',
      null
    )
    this.viewManagerDelegate.addFeature(newFeature, this.viewManagerDelegate.activeRenderLayer)
    this.viewManagerDelegate.view.addComponent('Text', newFeature.getParams(), [newFeature.ID])
    this.viewManagerDelegate.saveDeviceState()
  }

  showTarget () {
    const target = PositionTool.getTarget(this.lastPoint)
    Registry.viewManager.updateTarget(this.typeString, this.setString, target)
  }

  get text () {
    return this._text
  }

  set text (text) {
    this._text = text
  }
}
