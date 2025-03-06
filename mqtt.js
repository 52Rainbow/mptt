let client;
let isConnected = false; // 用于跟踪连接状态

function connect() {
    const broker = document.getElementById('broker').value;
    const clientId = document.getElementById('clientId').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    client = new Paho.MQTT.Client(broker, clientId);

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // 设置连接选项（包括用户名和密码）
    const connectOptions = {
        onSuccess: onConnect,
        onFailure: onFailure,
        userName: username,
        password: password,
        useSSL: broker.startsWith('wss://') // 如果Broker地址是wss://，则启用SSL
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
    messageLog.innerHTML = ""; // 清空所有消息
}

function updateConnectionStatus(status) {
    const connectionStatus = document.getElementById('connectionStatus');
    connectionStatus.textContent = status;
}

function logMessage(message, topic) {
    const messageLog = document.getElementById('messageLog');
    const li = document.createElement('li');

    // 显示时间
    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = new Date().toLocaleTimeString();
    li.appendChild(time);

    // 显示主题
    const topicElement = document.createElement('div');
    topicElement.className = 'topic';
    topicElement.textContent = "主题: " + topic;
    li.appendChild(topicElement);

    // 显示消息内容
    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = message;
    li.appendChild(content);

    messageLog.appendChild(li);

    // 自动滚动到底部
    messageLog.scrollTop = messageLog.scrollHeight;
}