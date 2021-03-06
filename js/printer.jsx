import React from 'react';

const Term = (props) => {
    const v = props.val;
    switch (v[0]) {
        case "Var":
            return (<span>{v[1]}</span>);
        case "App":
            if (props.lv > 1) {
                return (<span>(<Term val={v[1]} lv={1} /> <Term val={v[2]} lv={2} />)</span>);
            } else {
                return (<span><Term val={v[1]} lv={1} /> <Term val={v[2]} lv={2} /></span>);
            }
        case "Abs":
            if (props.lv > 0) {
                return (<span>(λ{v[1]}.<Term val={v[2]} lv={0} />)</span>);
            } else {
                return (<span>λ{v[1]}.<Term val={v[2]} lv={0} /></span>);
            }
        default:
            console.debug("unknown term");
            console.debug(v);
            return (<span></span>);
    };
}

export const Type = (props) => {
    const v = props.val;
    switch (v[0]) {
        case "Var":
            return (<span>α<sub>{v[1][0]}</sub><sup>{v[1][1]}</sup></span>);
        case "Arrow":
            if (props.lv > 0) {
                return (<span>(<Type val={v[1]} lv={1} /> → <Type val={v[2]} lv={0} />)</span>);
            } else {
                return (<span><Type val={v[1]} lv={1} /> → <Type val={v[2]} lv={0} /></span>);
            }
        case "Lift":
            return (<Type val={v[1]} lv={props.lv} />);
        case "Inter":
            if (props.lv > 2) {
                return (<span>(<Type val={v[1]} lv={3} /> ∧ <Type val={v[2]} lv={2} />)</span>);
            } else {
                return (<span><Type val={v[1]} lv={3} /> ∧ <Type val={v[2]} lv={2} /></span>);
            }
        case "Expand":
            return (<span>F<sub>{v[1][0]}</sub><sup>{v[1][1]}</sup><Type val={v[2]} lv={4} /></span>);
        default:
            console.debug("unkown type");
            console.debug(v);
            return (<span></span>);
    };
}

class Env extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
    }

    render() {
        if (this.state.visible) {
            return (<span className="env" onClick={ e => this.toggle() }>{this.render_assigns()}</span>);
        } else {
            return (<span className="env" onClick={ e => this.toggle() }>E</span>);
        }
    }

    toggle() {
        this.setState(Object.assign({}, this.state, {
            visible: !this.state.visible
        }));
    }

    render_assigns() {
        if (this.props.val.length === 0) {
            return (<span>∅</span>);
        } else if (this.props.val.length === 1) {
            return (<span>{this.props.val[0][0]}:<Type val={this.props.val[0][1]} /></span>);
        } else {
            return (<span>
                <span>{this.props.val[0][0]}:<Type val={this.props.val[0][1]} /></span>
                {this.props.val.slice(1).map(function(assign) {
                     return (<span key={assign.toString()}>; {assign[0]}:<Type val={assign[1]} /></span>);
                 })}
            </span>);
        }
    }
}

export const Constraint = (props) => {
    return (<ul>
        {props.val.map(function(eq) {
        return (<li key={eq.toString()}><Type val={eq[0]} /> ≐ <Type val={eq[1]} /></li>);
        })}
    </ul>);
}

const Expansion = (props) => {
    const v = props.val;
    switch (v[0]) {
        case "E_Hole":
            return (<span>□</span>);
        case "E_Inter":
            return (<span>(<Expansion val={v[1]} /> ∧ <Expansion val={v[2]} />)</span>);
        case "E_Expand":
            return (<span>(F<sub>{v[1][0]}</sub><sup>{v[1][1]}</sup> <Expansion val={v[2]} />)</span>);
        default:
            console.debug("unknown expansion");
            console.debug(v);
            return (<span></span>);
    }
}

export const Subst = (props) => {
    return (<ol>
        {props.val.map(function(st) {
            switch (st[0]) {
                case "T":
                    return (<li key={st.toString()}>α<sub>{st[1][0]}</sub><sup>{st[1][1]}</sup> := <Type val={st[2]} /></li>);
                case "E":
                    return (<li key={st.toString()}>F<sub>{st[1][0]}</sub><sup>{st[1][1]}</sup> := <Expansion val={st[2]} /></li>);
                default:
                    console.debug("unknown subst");
                    console.debug(st);
                    return (<span></span>);
            }
        })}
        </ol>);
}

const Judge = (props) => {
    const env = props.val[0];
    const term = props.val[1];
    const type = props.val[2];
    return (<span><Env val={env} /> ⊢ <Term val={term} /> : <Type val={type} /></span>);
}

export class Deriv extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true
        };
    }

    render() {
        const v = this.props.val;
        if (this.state.visible) {
            switch (v[0]) {
                case "Var":
                    return (<table><tbody>
            <tr className="premise"><td><div className="pad"></div></td></tr>
            <tr className="conclusion"><td><Judge val={v[1]} /><div className="rule" onClick={ e => this.toggle() }><div>Var</div></div></td></tr>
                    </tbody></table>);
                case "Inter":
                case "App":
                    return (<table><tbody>
                        <tr className="premise"><td><Deriv val={v[2]} /></td><td><div className="span"></div></td><td><Deriv val={v[3]} /></td></tr>
                        <tr className="conclusion"><td colSpan="3"><Judge val={v[1]} /><div className="rule" onClick={ e => this.toggle() }><div>{v[0]}</div></div></td></tr>
                    </tbody></table>);
                case "Abs_I":
                case "Abs_K":
                    return (<table><tbody>
                        <tr className="premise"><td><Deriv val={v[2]} /></td></tr>
                        <tr className="conclusion"><td><Judge val={v[1]} /><div className="rule" onClick={ e => this.toggle() }><div>{v[0]}</div></div></td></tr>
                    </tbody></table>);
                case "F":
                    return (<table><tbody>
                        <tr className="premise"><td><Deriv val={v[2]} /></td></tr>
                        <tr className="conclusion"><td><Judge val={v[1]} /><div className="rule" onClick={ e => this.toggle() }><div>F<sub>{v[3][0]}</sub><sup>{v[3][1]}</sup></div></div></td></tr>
                    </tbody></table>);
                default:
                    console.debug("unknown derivation");
                    console.debug(v);
                    return (<div></div>);
            }
        } else {
            var rulename = v[0];
            if (rulename === "F") {
                rulename = (<div>F<sub>{v[3][0]}</sub><sup>{v[3][1]}</sup></div>);
            } else {
                rulename = (<div>{rulename}</div>);
            }
            return (<table><tbody>
                        <tr className="premise"><td>⋮</td></tr>
                        <tr className="conclusion"><td><Judge val={v[1]} /><div className="rule" onClick={ e => this.toggle() }>{rulename}</div></td></tr>
            </tbody></table>);
        }
    }

    toggle() {
        this.setState(Object.assign({}, this.state, {
            visible: !this.state.visible
        }));
    }
}
