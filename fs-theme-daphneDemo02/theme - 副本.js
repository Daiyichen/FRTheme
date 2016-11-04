(function($) {
		FR.$defaultImport('/fstheme/fs-theme-daphneDemo02/jquery.nicescroll.min.js', 'js'); //引入自定义滚动条
		var moreIndex = 0;
		var iIndex = 0;
		var g_nodes = null;



		//重写FR._doResize方法
		FS._doResize = function(){ 
 			var head = FS.THEME.config4frame.north.visible ? (FS.THEME.config4frame.north.height || 60) : 0;
            var foot = FS.THEME.config4frame.south.visible ? 30 : 0;
            var clientWidth = document.body.clientWidth;
            var clientHeight = document.body.clientHeight;
            this.$body.css({
                height: clientHeight - head - foot,
                top: head
            });
            var w = this.$menu.width();
            this.$content.css({
                left: 0,  //只改动这个位置，content距左0， 宽度100%；
                width: clientWidth - 0
            });
            this.$footer.css({
                top: clientHeight - foot
            });
            if (this.tabPane) {
                var top = this.tabPane.element.height() - foot;
                if (this.tabPane.isExpanded()) {
                    top = 0;
                }
                this.tabPane.element.css('top', top);
                this.tabPane.doResize();
            }
		};

		window.onresize = function() {		

			//重新计算菜单可显示的数量

			_initNavList();
			$("#fs-frame-menu").html("");
			iIndex = 0;
			FS._initMenuTree(FS.THEME.config4MenuTree);

		}

		FS.THEME = $.extend(true, FS.THEME, {
			config4frame: {
				//上区域
				north: {
					height:100 //上方导航栏高度设置(不设置默认60px)
				},
				west: {
					width: 0
				}

			},
		
			config4navigation: {

				onAfterInit: function() {
				
					var self = this;

					//添加登录用户名过长的处理
					var $admin =  $("#fs-navi-admin").find("span");
					var spanName = $admin.text();
					$admin.attr("title", spanName);

					//处理数据决策系统名称
					$("#fs-frame-banner .fs-banner-title").attr("title",$("#fs-frame-banner .fs-banner-title").text());
					// $('#fs-frame-search').remove();
					//  var $reg = $('#fs-frame-reg');
					// if ($reg.length > 0) {
					//     $reg.remove();
					// }
					// 
					//收藏消息
					FS._showFavoriteCombo= function($obj, speed){
						 var self = this;
						 _showFavoriteFunc(self, $obj, speed);			       

					}

			
					$.ajax({
						url: FR.servletURL + "?op=fs_main&cmd=module_getrootreports",
						type: 'POST',
						async: false,
						data: {
							id: -1
						},
						success: function(res, status) {
							var nodes = $.parseJSON(res);
							$.ajax({
								url: FR.servletURL + "?op=fs_main&cmd=getmoduleitems",
								type: 'POST',
								async: false,
								data: {
									id: 1
								},
								success: function(res) {
									nodes.push($.parseJSON(res));

									g_nodes = nodes; //存到内存中
								}
							});

							var len = _menuLength(); //可放置菜单的长度
							moreIndex = len;


							var $ul = $('<ul class="node-navi"/>').appendTo($('#fs-frame-header'));
							$.each(nodes, function(index, root) {
								var $node = null
								if (index < len) {
									$node = $('<li class="node-navi-li"/>').appendTo($ul);
									var innerHtml = "<div  class='title-level1' title=" + root.text + "><span class='menu_item_icon menu_icon_" + index + "'></span>" + root.text + "</div>";
									$(innerHtml).appendTo($node);

								} else if (index == len) {
									$node = $('<li class="node-navi-li special-more-li"/>').appendTo($ul);
									innerHtml = "<div   class='title-level1' title=" + root.text + "><span class='menu_item_more'>●●●</span></div>";
									$(innerHtml).appendTo($node);
									$("#fs-frame-menu").width(228);
									var $rightMenu = $('<div class="fs-menutree"></div>').appendTo($('#fs-frame-menu'));
									$ulParent = $('<ul/>').appendTo($rightMenu);
									//$li = $('<li/>').appendTo($ulParent);

								} else {

								}

								//鼠标滑过，显示下拉菜单
								$dropdown = $('<div class="node-pane" style="display:none;"/>').appendTo($node);
								var $pane = $('<div class="node-pane-inner"/>').appendTo($dropdown);
								if (root.hasChildren && root.ChildNodes) {

									$.each(root.ChildNodes, function(index, child) {
										if (child.hasChildren) {
											var $w = $('<div class="node-wrapper haschildnode"/>').appendTo($pane);
											var $nodetitle = $('<div class="node-title"></div>').appendTo($w);
											$('<div class="node-title-inner"></div>').text(child.text).appendTo($nodetitle);
											var $thirdTitle = $('<div class="third-title"/>').appendTo($w);
											var childs = [];
											_collectAllChildNodes(child, childs);
											$.each(childs, function(i, n) {
												_createItem(n, $dropdown, $node).appendTo($thirdTitle);
											});


										} else {
											var $other = $('<div class="node-wrapper"/>').appendTo($pane);
											var $thirdpane = $('<div class="third-title"/>').appendTo($other);
											_createItem(child, $dropdown, $node).appendTo($other);
										}
									});
								} else {
									return;
								}

								_treeMenuLayout($pane);

							});

							//_redrawNodeLiWH(len);//重新调整菜单的宽度，使其平均
							_menuHover();
							_initscroll();
							_bindEvts();

						}
					});



				}
			},
			config4MenuTree: {
				onNodeCreate: function(node, $node, $li) {
					
					//一级目录
					if (1 == node.level) {
						iIndex++;
						if (iIndex > moreIndex) {
							_createMoreMenu(node, $node, $li);

						}
					} else {
						//二级目录
						_createMoreMenu(node, $node, $li);
					}
				},
				/*  	
	        onNodeExpand: function (node, $node, $parent) {
	        	console.log("expand");
	            return node.level !== 0;
	        },
	        onNodeClick: function (node, $node, $parent) {
	        	//console.log("click");
	           // $('#fs-frame-wrapper') .empty();
	            //return false;
	        },
	        onNodeCollapse:function(node, $node, $parent){ 
	

	        },*/
				onAfterInit: function(node, $node, $parent) {

					var wW = $(window).width();
					$('#fs-frame-content').css({
						left: 0,
						width: wW
					});

				}
			}
		});
			
		


		var _createItem = function(node, $pane, $node) {
			return $('<a href="#"/>').text(node.text)
				.click(function() {
					FS.tabPane.addItem(node);
					$node.removeClass('node-select');
					$node.addClass("activeLi").siblings("li").removeClass("activeLi");
					//$node.css({
					//	'color': 'rgb(45,167,220)'
					//});
					$pane.hide();

				});
		};
		var _collectAllChildNodes = function(node, childs) {
			var self = this;
			if (!node.ChildNodes) {
				return;
			}
			$.each(node.ChildNodes, function(index, child) {
				if (child.hasChildren) {
					_collectAllChildNodes(child, childs);
				} else {
					childs.push(child);
				}
			});
		};

		//鼠标滑过菜单事件
		var _menuHover = function() {
			

			$('.node-navi li').bind({

				mouseenter:function(){ 
			
				if ($(this).hasClass('special-more-li')) {
					
					//更多				
					$("#fs-frame-menu").animate({
						width:"228",
						right: "0"
					}, 300,function(callback){ 
						
					});

				} else {
					
					var li_Left = $(this).offset().left;//一级菜单距离左边的距离
					var wH = $(window).width();//窗口的总宽度
					var  curentW = $(this).width();//当前菜单的宽度
					var  node_pane_w = $(this).find(".node-pane-inner").width();
					//缩小浏览器窗口，处理二级菜单宽度超过屏幕款的的情况
					if(wH  < node_pane_w){ 
						$(this).find(".node-pane").width(wH - 20);
						$(this).find(".node-pane").css("left", "-160px");
						
					}
					else if(wH - li_Left < node_pane_w){ 
						//二级菜单展开的宽度大于剩余的宽度，向左移动
						$(this).find(".node-pane").css("left", -(node_pane_w - (wH - li_Left)) + "px");

					}
					else{}
					//
					$('.node-pane', this).slideDown(200);
					$(this).children('div:first').addClass("node-select");
				}

			},mouseleave:function(){ 
				$('.node-pane', this).slideUp(100);
				$(this).children('div:first').removeClass("node-select");
			}});

			$(this).unbind("mouseenter").unbind("mouseleave");  
			/*$('.node-navi li').hover(function() {
				if ($(this).hasClass('special-more-li')) {
					//更多
					$("#fs-frame-menu").animate({
						width:"230",
						right: "0"
					}, 300);

				} else {
					
					var li_Left = $(this).offset().left;//一级菜单距离左边的距离
					var wH = $(window).width();//窗口的总宽度
					var  curentW = $(this).width();//当前菜单的宽度
					var  node_pane_w = $(this).find(".node-pane-inner").width();
					//缩小浏览器窗口，处理二级菜单宽度超过屏幕款的的情况
					if(wH  < node_pane_w){ 
						$(this).find(".node-pane").width(wH - 20);
						$(this).find(".node-pane").css("left", "-160px");
						
					}
					else if(wH - li_Left < node_pane_w){ 
						//二级菜单展开的宽度大于剩余的宽度，向左移动
						$(this).find(".node-pane").css("left", -(node_pane_w - (wH - li_Left)) + "px");

					}
					else{}
					//
					$('.node-pane', this).slideDown(200);
					$(this).children('div:first').addClass("node-select");
				}

			}, function() {

				$('.node-pane', this).slideUp(100);
				$(this).children('div:first').removeClass("node-select");
			});

			*/
			//右侧菜单鼠标离开事件
			$("#fs-frame-menu").hover(function() {
				//暂不处理
			}, function() {
				$("#fs-frame-menu").animate({
					right: "-230px"
				}, 300);

			})

		};

		//判断当前页面能显示几个目录
		var _menuLength = function() {
			/*var wH = $(window).width();
			var menuH = wH - 164;
			var num = Math.floor(menuH / 130);
			//显示...的宽度定为70，看剩下的宽度是否大于70，如果大于，那么num +1
			if(menuH % 130 > 60){ 
				num ++;
			}
			return num;
			*/
			var wH = $(window).width();
			var menuH = wH - 70 -164;
			var num = Math.floor(wH / 130);
			return num;
		};

		//重新计算一级菜单的高度
		var _redrawNodeLiWH = function(size){ 
			var wH = $(window).width();
			var menuH = wH - 70 -164;
			var newW = Math.floor(wH / size);

			$(".node-navi-li").width(newW);
		};

		//计算二级菜单可以显示的宽度
		var _treeMenuLayout = function($pane) {
			var len = $pane.find(".node-wrapper").length;
			var len2 = $pane.find(".node-wrapper .node-title").length;
			var hasChildLen = $pane.find(".haschildnode").length;
			$pane.find(".haschildnode").eq(hasChildLen - 1).addClass("last-childnode");

			if (len2 > 0) {
				//有子节点
				if (len == len2) {
					if($(window).width() < (len2 *180)){ 
						$pane.width($(window).width() );

					}
					else{ 
						$pane.width(len2 * 　180 );
					}
					//如果每个子节点都有自己的子节点
					//$pane.width(len2 * 　183 + 20);
				} else if (len2 < len) {
					//如果只有某子节点有自己的子节点，其它的没有子节点
					$pane.width((len2 + 1) * 　180 );
				}

			} else {

				if (len > 6) {
					$pane.width(180);
				}
			}

		};

		//初始化滚动条
		var _initscroll = function() {
			/*$(".node-pane-inner").slimScroll({ 
				 color: 'red'
			});*/

			$(".node-pane-inner").niceScroll({
				cursorcolor: "#ffffff",
				cursoropacitymax: 1,
				touchbehavior: false,
				cursorwidth: "10px",
				cursorborder: "0",
				cursorborderradius: "5px",
				background: "#0091bb",
				horizrailenabled: true
			});

		};

		//创建显示更多的菜单
		var _createMoreMenu = function(node, $node, $li) {

			var $node = $('<a class="menutree-node"/>').data('NODE', node);

			if (node.level === 1) {
				//一级目录
				$node.addClass("fs-menu-item").attr('title', node.text).appendTo($li);
				if (node.isModule) {
					//管理系统固定图标
					FS.createIconFont("icon-menu-setting-a", "icon-menu-setting-b").appendTo($node);
				} else {
					//bug79802,ie8默认8进制，改成10进制
					var icon = FS.config.folderIcons[parseInt(node.id, 10)];
					// 若图标不存在，使用默认图标
					icon = icon ? icon : 'e642';
					FS.createIconFont('icon-' + icon + '-a', 'icon-' + icon + '-b').appendTo($node);
				}
				$('<span/>').text(node.text).appendTo($node);
			} else {
				//子目录
				$node.addClass("fs-menu-item menutree-child")
					.attr('title', node.text)
					.css({
						'padding-left': (node.level - 1) * 14 + 12
					})
					.appendTo($li);
				var $icon = $('<i class="tree-icon"/>').appendTo($node);
				if (node.hasChildren) {
					if (node.isexpand) {
						// 收起图标
						$icon.html('\ue624');
					} else {
						// 展开图标
						$icon.html('\ue61f');
					}
				} else {
					{
						$icon.addClass('icon-tree-leaf icon-tree-' + node.nodeicon);
					}
				}
				$('<span class="menutree-text"/>').text(node.text).appendTo($node);
			}

			return $node;

		};

		//绑定右侧更多里的事件
		var _bindEvts = function() {
			var doProxy = function(event) {
				var target = event.target;
				var $obj = $(target).closest('a.menutree-node');
				if ($obj && $obj.length > 0) {
					var type = event.type;
					if (type === 'mouseover') {
						$obj.addClass('fui-seb fui-fht');
					} else if (type === 'mouseout') {
						if (!$obj.hasClass('select')) {
							$obj.removeClass('fui-seb fui-fht');
						}
					} else if (type === 'click') {
						var node = $obj.data('NODE');
						FS.MenuTree.prototype.clickNode(node, $obj);
					}
				}
			};
			$("a.menutree-node").bind('mouseover', doProxy)
				.bind('mouseout', doProxy)
				.bind('click', doProxy);
		};


		var _initNavList = function() {

			var len = _menuLength(); //可放置菜单的长度
			moreIndex = len;
			$("ul.node-navi").remove();

			var $ul = $('<ul class="node-navi"/>').appendTo($('#fs-frame-header'));
			$.each(g_nodes, function(index, root) {
					var $node = null
					if (index < len) {
						$node = $('<li class="node-navi-li"/>').appendTo($ul);
						var innerHtml = "<div  class='title-level1' title=" + root.text + "><span class='menu_item_icon menu_icon_" + index + "'></span>" + root.text + "</div>";
						$(innerHtml).appendTo($node);

					} else if (index == len) {
						$node = $('<li class="node-navi-li special-more-li"/>').appendTo($ul);
						innerHtml = "<div   class='title-level1' title=" + root.text + "><span class='menu_item_more'>●●●</span></div>";
						$(innerHtml).appendTo($node);
						$("#fs-frame-menu").width(228);
						var $rightMenu = $('<div class="fs-menutree"></div>').appendTo($('#fs-frame-menu'));
						$ulParent = $('<ul/>').appendTo($rightMenu);
						
					} else {

					}

					//鼠标滑过，显示下拉菜单
					$dropdown = $('<div class="node-pane" style="display:none;"/>').appendTo($node);
					var $pane = $('<div class="node-pane-inner"/>').appendTo($dropdown);
					if (root.hasChildren && root.ChildNodes) {

						$.each(root.ChildNodes, function(index, child) {
							if (child.hasChildren) {
								var $w = $('<div class="node-wrapper haschildnode"/>').appendTo($pane);
								$('<div class="node-title"/>').text(child.text).appendTo($w);
								var childs = [];
								_collectAllChildNodes(child, childs);
								$.each(childs, function(i, n) {
									_createItem(n, $dropdown, $node).appendTo($w);
								});


							} else {
								var $other = $('<div class="node-wrapper"/>').appendTo($pane);
								_createItem(child, $dropdown, $node).appendTo($other);
							}
						});
					} else {
						return;
					}

					_treeMenuLayout($pane);

				});
				_redrawNodeLiWH(len);//重新调整菜单的宽度，使其平均
				_menuHover();
				_initscroll();
				_bindEvts();
		}

		//重写FS的收藏事件，只改了下面备注的地方
		var _showFavoriteFunc = function(self, $obj, speed){ 
					//var self = this;
			           var $wrapper = $obj.data('COMBO');
			            if (!$wrapper) {
			                $wrapper = $('<div class="fs-favorite-combo"/>')
			                    .hide().appendTo($obj);
			                $obj.data('COMBO', $wrapper);
			            }
			            var head = FS.THEME.config4frame.north.visible ? (FS.THEME.config4frame.north.height || 60) : 0;
			            var foot = FS.THEME.config4frame.south.visible ? 30 : 0;
			            $wrapper.empty().css({
			                height: document.body.clientHeight - head - foot,
			                'z-Index': FR.widget.opts.zIndex++
			            });
			            $('<div class="fs-favorite-combo-title"/>')
			                .text(FR.i18nText("FS-Generic-Simple_Favorite")).appendTo($wrapper);
			            var $list = $('<div class="fs-favorite-combo-list"/>').appendTo($wrapper);
			            // 生成收藏夹
			            var nodes = self.Control.getFavoriteNodes();
			            if (nodes && nodes.length > 0) {
			                $.each(nodes, function (index, node) {
			                    var $node = $('<a href="#"/>').attr('title', node.entry.text).data('FAVORITE', node).appendTo($list);
			                    $('<span/>').text(node.entry.text).appendTo($node);
			                    var $del = $('<i class="icon-remove-favorite"/>').hide().appendTo($node);
			                    $node.hover(function () {
			                        $del.show();
			                    }, function () {
			                        $del.hide();
			                    })
			                });
			                $wrapper.click(function (e) {
			                    var $target = $(e.target);
			                    var $entry = $target.closest('a');
			                    var node = $entry.data('FAVORITE');
			                    if ($entry && $entry.length > 0) {
			                        if ($target.hasClass('icon-remove-favorite')) {
			                            //删除收藏
			                            self.Control.removeFavoriteNode(node.id, function () {
			                                $entry.remove();
			                            });
			                        } else {
			                            //打开收藏
			                            $wrapper.hide();
			                            self.loadContentByEntry(node.entry);
			                        }
			                    }
			                });
			            }
			            $list.slimscroll({
			                position: 'relative',
			                width: '260px',
			                height: (document.body.clientHeight - 97 -60) + 'px'   //备注：这里之前是写死的112px, 因为高度由60->97了，所以会有问题。这里把高度设置小一点了
			            });
			            $wrapper.slideDown(speed);
		}
})(jQuery);