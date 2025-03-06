let client;
let isConnected = false;

function connect() {
    const broker = document.getElementById('broker').value;
    const port = document.getElementById('port').value; // 获取选择的端口
    const clientId = document.getElementById('clientId').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 创建 MQTT 客户端
    client = new Paho.MQTT.Client(broker, Number(port), clientId);

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // 设置连接选项
    const connectOptions = {
        onSuccess: onConnect,
        onFailure: onFailure,
        userName: username,
        password: password,
        useSSL: port === "8883" // 如果端口是 8883，则启用 SSL
    };

    client.connect(connectOptions);
}

function onConnect() {
    isConnected = true;
    updateConnectionStatus("已连接");
    logMessage("Connected to broker", "系统消息");
}

function onFailure(message) {
    isConnected = false;
    updateConnectionStatus("连接失败");
    logMessage("Connection failed: " + message.errorMessage, "系统消息");
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        isConnected = false;
        updateConnectionStatus("连接丢失");
        logMessage("Connection lost: " + responseObject.errorMessage, "系统消息");
    }
}

function onMessageArrived(message) {
    const topic = message.destinationName;
    const payload = message.payloadString;
    logMessage(payload, topic);
}

function subscribe() {
    if (!isConnected) {
        logMessage("请先连接到MQTT Broker", "系统消息");
        return;
    }

    const topic = document.getElementById('topic').value;
    client.subscribe(topic, {
        onSuccess: () => logMessage("Subscribed to " + topic, "系统消息"),
        onFailure: () => logMessage("Failed to subscribe to " + topic, "系统消息")
    });
}

function publish() {
    if (!isConnected) {
        logMessage("请先连接到MQTT Broker", "系统消息");
        return;
    }

    const topic = document.getElementById('topic').value;
    const message = document.getElementById('message').value;

    const mqttMessage = new Paho.MQTT.Message(message);
    mqttMessage.destinationName = topic;

    client.send(mqttMessage);
    logMessage("Published: " + message + " to topic: " + topic, "系统消息");
}

function disconnect() {
    if (client && isConnected) {
        client.disconnect();
        isConnected = false;
        updateConnectionStatus("未连接");
        logMessage("Disconnected from broker", "系统消息");
    }
}

function clearMessages() {
    const messageLog = document.getElementById('messageLog');
    messageLog.innerHTML = "";
}

function updateConnectionStatus(status) {
    const connectionStatus = document.getElementById('connectionStatus');
    connectionStatus.textContent = status;
}

function logMessage(message, topic) {
    const messageLog = document.getElementById('messageLog');
    const li = document.createElement('li');

    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = new Date().toLocaleTimeString();
    li.appendChild(time);

    const topicElement = document.createElement('div');
    topicElement.className = 'topic';
    topicElement.textContent = "主题: " + topic;
    li.appendChild(topicElement);

    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = message;
    li.appendChild(content);

    messageLog.appendChild(li);
    messageLog.scrollTop = messageLog.scrollHeight;
}