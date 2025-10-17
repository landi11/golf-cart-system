from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
from datetime import datetime
import base64
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 数据存储路径
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
QUOTES_FILE = os.path.join(DATA_DIR, 'quotes.json')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)

# 初始化报价单数据文件
if not os.path.exists(QUOTES_FILE):
    with open(QUOTES_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)


# ========== 工具函数 ==========

def load_quotes():
    """加载所有报价单"""
    try:
        with open(QUOTES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"加载报价单失败: {e}")
        return []


def save_quotes(quotes):
    """保存报价单"""
    try:
        with open(QUOTES_FILE, 'w', encoding='utf-8') as f:
            json.dump(quotes, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存报价单失败: {e}")
        return False


# ========== API 路由 ==========

@app.route('/api/quotes/submit', methods=['POST'])
def submit_quote():
    """接收前端提交的初始报价单"""
    try:
        data = request.json

        # 生成唯一ID
        quote_id = f"QUOTE_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(load_quotes()) + 1}"

        # 构建报价单对象
        quote = {
            'id': quote_id,
            'quoteNumber': data.get('quoteNumber'),
            'createTime': data.get('createTime', datetime.now().isoformat()),
            'updateTime': datetime.now().isoformat(),
            'products': data.get('products', []),
            'productCount': data.get('productCount', 0),
            'subtotal': data.get('subtotal', 0),
            'discount': data.get('discount', 0),
            'tax': data.get('tax', 0),
            'total': data.get('total', 0),
            'template': data.get('template', {}),
            'status': 'pending',  # 待审核
            'customerInfo': data.get('customerInfo', ''),
            'remarks': ''
        }

        # 加载现有报价单
        quotes = load_quotes()
        quotes.append(quote)

        # 保存
        if save_quotes(quotes):
            return jsonify({
                'success': True,
                'message': '报价单提交成功',
                'id': quote_id,
                'quoteNumber': quote['quoteNumber']
            }), 200
        else:
            return jsonify({'success': False, 'message': '保存失败'}), 500

    except Exception as e:
        print(f"提交报价单错误: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/quotes', methods=['GET'])
def get_quotes():
    """获取所有报价单列表"""
    try:
        quotes = load_quotes()
        return jsonify({
            'success': True,
            'data': quotes
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/quotes/<quote_id>', methods=['GET'])
def get_quote(quote_id):
    """获取单个报价单详情"""
    try:
        quotes = load_quotes()
        quote = next((q for q in quotes if q['id'] == quote_id), None)

        if quote:
            return jsonify({
                'success': True,
                'data': quote
            }), 200
        else:
            return jsonify({'success': False, 'message': '报价单不存在'}), 404

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/quotes/<quote_id>', methods=['PUT'])
def update_quote(quote_id):
    """修改报价单信息（管理员）"""
    try:
        quotes = load_quotes()
        quote_index = next((i for i, q in enumerate(quotes) if q['id'] == quote_id), None)

        if quote_index is None:
            return jsonify({'success': False, 'message': '报价单不存在'}), 404

        # 更新数据
        update_data = request.json
        quote = quotes[quote_index]

        # 允许修改的字段
        if 'products' in update_data:
            quote['products'] = update_data['products']
        if 'subtotal' in update_data:
            quote['subtotal'] = update_data['subtotal']
        if 'discount' in update_data:
            quote['discount'] = update_data['discount']
        if 'tax' in update_data:
            quote['tax'] = update_data['tax']
        if 'total' in update_data:
            quote['total'] = update_data['total']
        if 'customerInfo' in update_data:
            quote['customerInfo'] = update_data['customerInfo']
        if 'remarks' in update_data:
            quote['remarks'] = update_data['remarks']

        # 更新时间
        quote['updateTime'] = datetime.now().isoformat()

        # 保存
        if save_quotes(quotes):
            return jsonify({
                'success': True,
                'message': '报价单更新成功',
                'data': quote
            }), 200
        else:
            return jsonify({'success': False, 'message': '保存失败'}), 500

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/quotes/<quote_id>/status', methods=['PUT'])
def update_quote_status(quote_id):
    """更新报价单状态（审核/拒绝）"""
    try:
        quotes = load_quotes()
        quote_index = next((i for i, q in enumerate(quotes) if q['id'] == quote_id), None)

        if quote_index is None:
            return jsonify({'success': False, 'message': '报价单不存在'}), 404

        data = request.json
        new_status = data.get('status')

        # 验证状态值
        valid_statuses = ['pending', 'approved', 'rejected', 'completed']
        if new_status not in valid_statuses:
            return jsonify({'success': False, 'message': '无效的状态值'}), 400

        # 更新状态
        quotes[quote_index]['status'] = new_status
        quotes[quote_index]['updateTime'] = datetime.now().isoformat()

        # 保存
        if save_quotes(quotes):
            return jsonify({
                'success': True,
                'message': '状态更新成功',
                'status': new_status
            }), 200
        else:
            return jsonify({'success': False, 'message': '保存失败'}), 500

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/quotes/<quote_id>/export', methods=['GET'])
def export_quote_pdf(quote_id):
    """导出最终报价单为PDF（仅限已审核通过的）"""
    try:
        quotes = load_quotes()
        quote = next((q for q in quotes if q['id'] == quote_id), None)

        if not quote:
            return jsonify({'success': False, 'message': '报价单不存在'}), 404

        if quote['status'] != 'approved':
            return jsonify({'success': False, 'message': '仅已审核通过的报价单可以导出'}), 400

        # 生成PDF（简化版，实际项目中可使用更复杂的PDF生成库）
        buffer = BytesIO()

        # 创建PDF
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # 设置标题
        p.setFont("Helvetica-Bold", 20)
        p.drawString(100, height - 100, f"Quote: {quote['quoteNumber']}")

        # 基本信息
        p.setFont("Helvetica", 12)
        y_position = height - 150
        p.drawString(100, y_position, f"Status: {quote['status']}")
        y_position -= 30
        p.drawString(100, y_position, f"Total: ${quote['total']}")

        # 保存PDF
        p.showPage()
        p.save()

        # 返回PDF文件
        buffer.seek(0)
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"quote_{quote['quoteNumber']}.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        print(f"导出PDF错误: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/quotes/<quote_id>', methods=['DELETE'])
def delete_quote(quote_id):
    """删除报价单"""
    try:
        quotes = load_quotes()
        quote_index = next((i for i, q in enumerate(quotes) if q['id'] == quote_id), None)

        if quote_index is None:
            return jsonify({'success': False, 'message': '报价单不存在'}), 404

        # 删除
        deleted_quote = quotes.pop(quote_index)

        # 保存
        if save_quotes(quotes):
            return jsonify({
                'success': True,
                'message': '报价单已删除',
                'deletedQuote': deleted_quote['quoteNumber']
            }), 200
        else:
            return jsonify({'success': False, 'message': '保存失败'}), 500

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ========== 启动服务器 ==========

if __name__ == '__main__':
    print("=" * 60)
    print("Golf Cart Quote System - Backend Server Starting...")
    print("=" * 60)
    print("API Address: http://localhost:5000")
    print("Available Endpoints:")
    print("  - POST   /api/quotes/submit          Submit initial quote")
    print("  - GET    /api/quotes                 Get all quotes")
    print("  - GET    /api/quotes/<id>            Get quote details")
    print("  - PUT    /api/quotes/<id>            Update quote")
    print("  - PUT    /api/quotes/<id>/status     Update quote status")
    print("  - GET    /api/quotes/<id>/export     Export PDF")
    print("  - DELETE /api/quotes/<id>            Delete quote")
    print("=" * 60)
    print("")

    app.run(host='0.0.0.0', port=5000, debug=True)
