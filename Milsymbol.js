import React from 'react';
import PropTypes from 'prop-types';
import ms from 'milsymbol';

export default class Milsymbol extends React.Component {
  static propTypes = {
    sidc: PropTypes.string.isRequired,
    options: PropTypes.object,
  }

  static defaultProps = {
    sidc: 'SFGPUCIN---D***',
    options: { size: 30 },
  }

  createSymbol(sidc, options) {
    function processInstructions(drawInstructions) {
      let arr = [];
      drawInstructions.forEach(instruction => {
        if(Array.isArray(instruction)) {
          arr.push(processInstructions(instruction));
        } else {
          // let svg;
          let props;
          if(typeof instruction === 'object') {
            if(instruction.type === 'svg') {
              // Not sure what to do here yet
              // svg.instruction.svg;
            } else {
              // CREATE INITIAL PROPS FOR COMPONENTS:
              switch(instruction.type) {
                case 'path':
                  props = { type: instruction.type, d: instruction.d }
                  break;
                case 'circle':
                  props = { type: instruction.type, cx: instruction.cx, cy: instruction.cy, r: instruction.r }
                  break;
                case 'text':
                  props = { type: instruction.type, x: instruction.x, y: instruction.y, textAnchor: instruction.textanchor, fontSize: instruction.fontsize, fontFamily: instruction.fontfamily, fontWeight: instruction.fontweight ? instruction.fontweight : null }
                  props.children = instruction.text;
                  break;
                case 'translate':
                  props = { type: 'g', transform: 'translate(' + instruction.x + ',' + instruction.y + ')' }
                  props.children = processInstructions(instruction.draw);
                  break;
                case 'rotate':
                  props = { type: 'g', transform: 'rotate(' + instruction.degree + ',' + instruction.x + ',' + instruction.y + ')' }
                  props.children = processInstructions(instruction.draw);
                  break;
                case 'scale':
                  props = { type: 'g', transform: 'scale(' + instruction.factor + ')' }
                  props.children = processInstructions(instruction.draw);
                  break; 
              }

              // ... ADDITIONAL PROPS: Stroke
              if(typeof instruction.stroke !== 'undefined') {
                props = {...props, ...{ strokeWidth: (instruction.strokewidth || s.style.strokeWidth) }}
                
                if(instruction.strokedasharray)
                  props = {...props, ...{ strokeDasharray: instruction.strokedasharray }}
                
                if(instruction.linecap)
                  props = {...props, ...{ strokeLinecap: instruction.linecap, strokeLinejoin: instruction.linecap }}
                
                if(instruction.stroke) {
                  props = {...props, ...{ stroke: instruction.stroke }}
                } else {
                  props = {...props, ...{ stroke: 'none' }}
                }
              }

              // ... ADDITIONAL PROPS: Fill
              if (typeof instruction.fill !== "undefined")
                props = {...props, ...{ fill: instruction.fill ? instruction.fill : 'none' }}

              if (typeof instruction.fillopacity !== "undefined")
                props = {...props, ...{ fillOpacity: instruction.fillopacity }}

            }
          }
          if(props) arr.push(React.createElement(props.type, props))
        }
      });
      return arr;
    }

    const s = new ms.Symbol(sidc, options);
    return  <svg  xmlns={ ms._svgNS } version="1.2" baseProfile="tiny" width={ s.width } height={ s.height } viewBox={ (s.bbox.x1 - s.style.strokeWidth - s.style.outlineWidth) + ' ' + (s.bbox.y1 - s.style.strokeWidth - s.style.outlineWidth) + ' ' + s.baseWidth + ' ' + s.baseHeight } >
              { processInstructions(s.drawInstructions) }
            </svg>
  }

  render() {
    return this.createSymbol(this.props.sidc, this.props.options);
  }
}
