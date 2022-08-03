import {generateUUID} from "ant-design-vue/lib/vc-select/util";

export class DynamicWorker {
    constructor(cb) {
        const _flag = `let _flag;`;

        const _fn = `const _fn = ${cb.toString()};`;

        const _successCallBack = `let _successCallBack;`;
        const _xmlHttp = ` const _xmlHttp = new XMLHttpRequest();
            _xmlHttp.onreadystatechange = () => {
                if (_xmlHttp.readyState === 4 && _xmlHttp.status === 200) {
                    _successCallBack && _successCallBack(_xmlHttp.responseText);
                }
            };   
        `;
        // new XMLHttpRequest()
        const _sendHttpRequest = `_sendHttpRequest = function (method, url, async = false, successCallBack, postData) {
            _xmlHttp.open(method, url, async);
            _successCallBack = successCallBack;
            let sendData = (method === "post" || method === "POST") && postData && JSON.stringify(postData);
            sendData ? _xmlHttp.send(sendData) : _xmlHttp.send();
        };`;

        const _postMessage = `_postMessage = function(data){ 
            self.postMessage({
                data: data,
                flag: _flag
            });
        };`;

        const _handle = ` onmessage =  function ({ data: { data, flag } }) {
            _flag = flag;
            let result = _fn(data);
            result ? _postMessage(result) : "" ;
        }`;

        const _handleResult = ({data: {data, flag}}) => {
            const _res = this._map[flag];
            if (_res) {
                _res(data);
            }
        }

        const blob = new Blob([_flag + _fn + _successCallBack + _xmlHttp + _sendHttpRequest + _postMessage + _handle], {type: 'text/javascript'});
        this.worker = new Worker(URL.createObjectURL(blob));
        this._map = {};
        this.worker.addEventListener('message', _handleResult);
        URL.revokeObjectURL(blob);
    }

    send(data, onmessageFuc) {
        const worker = this.worker;
        const flag = generateUUID();
        worker.postMessage({
            data,
            flag,
        });
        if (onmessageFuc) {
            this._map[flag] = onmessageFuc;
        }
    }

    terminate() {
        this.worker.terminate();
    }
}
