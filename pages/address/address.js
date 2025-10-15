// pages/address/address.js
const addressParser = require('../../utils/addressParser.js');

Page({
  data: {
    addressList: [],      // 地址列表
    selectedId: null,     // 当前选中的地址ID（从结算页面跳转时使用）
    fromCheckout: false,  // 是否从结算页面跳转过来
    
    // 编辑/添加地址弹窗
    showEditDialog: false,
    editingAddress: null, // 正在编辑的地址
    
    // 表单数据
    formName: '',
    formPhone: '',
    formProvince: '',
    formCity: '',
    formDistrict: '',
    formDetail: '',
    formIsDefault: false,
    
    // 智能识别
    pasteText: '',
    showPasteDialog: false
  },

  onLoad(options) {
    // 检查是否从结算页面跳转
    if (options.from === 'checkout') {
      this.setData({
        fromCheckout: true,
        selectedId: options.selectedId ? parseInt(options.selectedId) : null
      })
    }
    
    // 加载本地地址数据
    this.loadAddressList()
  },

  // 加载地址列表
  loadAddressList() {
    try {
      const addressList = wx.getStorageSync('addressList') || []
      this.setData({
        addressList: addressList
      })
      console.log('加载地址列表', addressList.length, '个地址')
    } catch (error) {
      console.error('加载地址列表失败', error)
      this.setData({
        addressList: []
      })
    }
  },

  // 保存地址列表到本地
  saveAddressList(addressList) {
    try {
      wx.setStorageSync('addressList', addressList)
      console.log('地址列表已保存到本地')
    } catch (error) {
      console.error('保存地址列表失败', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 显示添加地址弹窗
  showAddDialog() {
    this.setData({
      showEditDialog: true,
      editingAddress: null,
      formName: '',
      formPhone: '',
      formProvince: '',
      formCity: '',
      formDistrict: '',
      formDetail: '',
      formIsDefault: false
    })
  },

  // 显示编辑地址弹窗
  showEditDialogHandler(e) {
    const { id } = e.currentTarget.dataset
    const address = this.data.addressList.find(item => item.id === id)
    
    if (address) {
      this.setData({
        showEditDialog: true,
        editingAddress: address,
        formName: address.name,
        formPhone: address.phone,
        formProvince: address.province,
        formCity: address.city,
        formDistrict: address.district,
        formDetail: address.detail,
        formIsDefault: address.isDefault
      })
    }
  },

  // 关闭编辑弹窗
  closeEditDialog() {
    this.setData({
      showEditDialog: false
    })
  },

  // 表单输入
  onNameInput(e) {
    this.setData({ formName: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ formPhone: e.detail.value })
  },

  onProvinceInput(e) {
    this.setData({ formProvince: e.detail.value })
  },

  onCityInput(e) {
    this.setData({ formCity: e.detail.value })
  },

  onDistrictInput(e) {
    this.setData({ formDistrict: e.detail.value })
  },

  onDetailInput(e) {
    this.setData({ formDetail: e.detail.value })
  },

  onDefaultChange(e) {
    this.setData({ formIsDefault: e.detail.value })
  },

  // 智能粘贴
  showPasteDialogHandler() {
    this.setData({
      showPasteDialog: true,
      pasteText: ''
    })
  },

  closePasteDialog() {
    this.setData({
      showPasteDialog: false
    })
  },

  onPasteTextInput(e) {
    this.setData({ pasteText: e.detail.value })
  },

  // 智能识别地址信息（使用第三方算法）
  parseAddressText() {
    const { pasteText } = this.data
    
    if (!pasteText.trim()) {
      wx.showToast({
        title: '请输入地址信息',
        icon: 'none'
      })
      return
    }

    try {
      console.log('[地址识别] 原始输入:', pasteText)
      
      // 使用第三方地址解析算法
      const result = addressParser.parseAddress(pasteText)
      
      // 验证解析结果
      const validation = addressParser.validateResult(result)
      
      console.log('[地址识别] 解析结果:', result)
      console.log('[地址识别] 验证结果:', validation)
      
      // 填充表单（只填充识别到的字段）
      const updateData = {
        showPasteDialog: false
      }
      
      if (result.name) updateData.formName = result.name
      if (result.phone) updateData.formPhone = result.phone
      if (result.province) updateData.formProvince = result.province
      if (result.city) updateData.formCity = result.city
      if (result.district) updateData.formDistrict = result.district
      if (result.detail) updateData.formDetail = result.detail
      
      this.setData(updateData)
      
      // 统计识别到的字段数量
      const recognizedFields = [
        result.name,
        result.phone,
        result.province,
        result.city,
        result.district,
        result.detail
      ].filter(Boolean)
      
      const recognizedCount = recognizedFields.length
      
      // 显示识别结果
      if (recognizedCount >= 4) {
        wx.showToast({
          title: `识别成功(${recognizedCount}项)`,
          icon: 'success',
          duration: 2000
        })
      } else if (recognizedCount > 0) {
        wx.showToast({
          title: `识别完成(${recognizedCount}项)`,
          icon: 'none',
          duration: 2000
        })
        
        // 如果识别不完整，给出提示
        if (validation.warnings.length > 0) {
          setTimeout(() => {
            wx.showToast({
              title: '请补充缺失信息',
              icon: 'none',
              duration: 1500
            })
          }, 2000)
        }
      } else {
        wx.showToast({
          title: '识别失败，请手动输入',
          icon: 'none',
          duration: 2000
        })
      }
      
    } catch (error) {
      console.error('[地址识别] 解析失败:', error)
      wx.showToast({
        title: '识别出错，请重试',
        icon: 'none'
      })
    }
  },

  // 保存地址
  saveAddress() {
    const { 
      formName, formPhone, formProvince, formCity, 
      formDistrict, formDetail, formIsDefault, 
      editingAddress, addressList 
    } = this.data

    // 验证
    if (!formName.trim()) {
      wx.showToast({ title: '请输入收件人', icon: 'none' })
      return
    }

    if (!formPhone.trim() || !/^1[3-9]\d{9}$/.test(formPhone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    if (!formProvince.trim() || !formCity.trim()) {
      wx.showToast({ title: '请输入省市信息', icon: 'none' })
      return
    }

    if (!formDetail.trim()) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' })
      return
    }

    let newAddressList = [...addressList]

    if (editingAddress) {
      // 编辑现有地址
      newAddressList = newAddressList.map(item => {
        if (item.id === editingAddress.id) {
          return {
            ...item,
            name: formName.trim(),
            phone: formPhone.trim(),
            province: formProvince.trim(),
            city: formCity.trim(),
            district: formDistrict.trim(),
            detail: formDetail.trim(),
            isDefault: formIsDefault
          }
        }
        // 如果设置为默认，其他地址取消默认
        if (formIsDefault && item.isDefault) {
          return { ...item, isDefault: false }
        }
        return item
      })
    } else {
      // 添加新地址
      const newAddress = {
        id: Date.now(),
        name: formName.trim(),
        phone: formPhone.trim(),
        province: formProvince.trim(),
        city: formCity.trim(),
        district: formDistrict.trim(),
        detail: formDetail.trim(),
        isDefault: formIsDefault
      }

      // 如果设置为默认，其他地址取消默认
      if (formIsDefault) {
        newAddressList = newAddressList.map(item => ({
          ...item,
          isDefault: false
        }))
      }

      newAddressList.push(newAddress)
    }

    // 如果是第一个地址，自动设为默认
    if (newAddressList.length === 1) {
      newAddressList[0].isDefault = true
    }

    // 保存到本地
    this.saveAddressList(newAddressList)

    this.setData({
      addressList: newAddressList,
      showEditDialog: false
    })

    wx.showToast({
      title: editingAddress ? '修改成功' : '添加成功',
      icon: 'success'
    })
  },

  // 删除地址
  deleteAddress(e) {
    const { id } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          let newAddressList = this.data.addressList.filter(item => item.id !== id)
          
          // 如果删除的是默认地址，且还有其他地址，将第一个设为默认
          const deletedAddress = this.data.addressList.find(item => item.id === id)
          if (deletedAddress && deletedAddress.isDefault && newAddressList.length > 0) {
            newAddressList[0].isDefault = true
          }

          this.saveAddressList(newAddressList)
          
          this.setData({
            addressList: newAddressList
          })

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 设置默认地址
  setDefaultAddress(e) {
    const { id } = e.currentTarget.dataset
    
    const newAddressList = this.data.addressList.map(item => ({
      ...item,
      isDefault: item.id === id
    }))

    this.saveAddressList(newAddressList)

    this.setData({
      addressList: newAddressList
    })

    wx.showToast({
      title: '已设为默认',
      icon: 'success'
    })
  },

  // 选择地址（从结算页面跳转时）
  selectAddress(e) {
    if (!this.data.fromCheckout) {
      return
    }

    const { id } = e.currentTarget.dataset
    const address = this.data.addressList.find(item => item.id === id)

    if (address) {
      // 返回上一页并传递选中的地址
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      
      if (prevPage) {
        prevPage.setData({
          selectedAddress: address
        })
      }

      wx.navigateBack()
    }
  }
})

