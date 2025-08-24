class CollaborativeDrawing {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.colorPicker = document.getElementById('colorPicker');
        this.brushSize = document.getElementById('brushSize');
        this.sizeValue = document.getElementById('sizeValue');
        this.clearBtn = document.getElementById('clearBtn');
        this.userCount = document.getElementById('userCount');
        
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.socket = new WebSocket(`ws://${window.location.host}`);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupWebSocket();
        this.resizeCanvas();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Controls
        this.colorPicker.addEventListener('change', this.updateBrush.bind(this));
        this.brushSize.addEventListener('input', this.updateBrushSize.bind(this));
        this.clearBtn.addEventListener('click', this.clearCanvas.bind(this));

        // Window resize
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    setupWebSocket() {
        this.socket.onopen = () => {
            console.log('Connected to server');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'draw':
                    this.drawRemote(data.data);
                    break;
                case 'clear':
                    this.clearLocalCanvas();
                    break;
                case 'history':
                    this.loadHistory(data.data);
                    break;
                case 'users':
                    this.updateUserCount(data.count);
                    break;
            }
        };

        this.socket.onclose = () => {
            console.log('Disconnected from server');
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        [this.lastX, this.lastY] = [pos.x, pos.y];
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        e.preventDefault();
        const pos = this.getMousePos(e);
        
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.brushSize.value;
        this.ctx.strokeStyle = this.colorPicker.value;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        // Send drawing data to server
        const drawingData = {
            type: 'draw',
            data: {
                startX: this.lastX,
                startY: this.lastY,
                endX: pos.x,
                endY: pos.y,
                color: this.colorPicker.value,
                size: this.brushSize.value
            }
        };
        
        this.socket.send(JSON.stringify(drawingData));
        
        [this.lastX, this.lastY] = [pos.x, pos.y];
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        this.canvas.dispatchEvent(mouseEvent);
    }

    drawRemote(data) {
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = data.size;
        this.ctx.strokeStyle = data.color;
        
        this.ctx.beginPath();
        this.ctx.moveTo(data.startX, data.startY);
        this.ctx.lineTo(data.endX, data.endY);
        this.ctx.stroke();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Send clear command to server
        this.socket.send(JSON.stringify({
            type: 'clear'
        }));
    }

    clearLocalCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateBrush() {
        this.ctx.strokeStyle = this.colorPicker.value;
    }

    updateBrushSize() {
        this.sizeValue.textContent = `${this.brushSize.value}px`;
        this.ctx.lineWidth = this.brushSize.value;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * ratio;
        this.canvas.height = this.canvas.offsetHeight * ratio;
        this.ctx.scale(ratio, ratio);
    }

    loadHistory(history) {
        history.forEach(data => {
            this.drawRemote(data);
        });
    }

    updateUserCount(count) {
        this.userCount.textContent = `${count} user${count !== 1 ? 's' : ''} online`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CollaborativeDrawing();
});