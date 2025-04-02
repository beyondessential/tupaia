'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

//  parent           |name                        |code                              |
// -----------------+----------------------------+----------------------------------+
// Attapue          |Sanxay District             |LA_Sanxay District                |
// Attapue          |Sanamxay District           |LA_Sanamxay District              |
// Attapue          |Samakkhixay District        |LA_Samakkhixay District           |
// Attapue          |Phouvong District           |LA_Phouvong District              |
// Attapue          |Saysetha District           |LA_Saysetha District              |
// Bokeo            |Meung District              |LA_Meung District                 |
// Bokeo            |Huoixai District            |LA_Huoixai District               |
// Bokeo            |Pha oudom District          |LA_Pha oudom District             |
// Bokeo            |Paktha District             |LA_Paktha District                |
// Bokeo            |Tonpheung District          |LA_Tonpheung District             |
// Bolikhamsai      |Pakkading District          |LA_Pakkading District             |
// Bolikhamsai      |Viengthong District         |LA_Viengthong District            |
// Bolikhamsai      |Pakxane District            |LA_Pakxane District               |
// Bolikhamsai      |Xaychamphone District       |LA_Xaychamphone District          |
// Bolikhamsai      |Bolikhanh District          |LA_Bolikhanh District             |
// Bolikhamsai      |Thaphabath District         |LA_Thaphabath District            |
// Bolikhamsai      |Khamkeuth District          |LA_Khamkeuth District             |
// Champasack       |Champasack District         |LA_Champasack District            |
// Champasack       |Pakse District              |LA_Pakse District                 |
// Champasack       |Phonthong District          |LA_Phonthong District Champasack  |
// Champasack       |Sanasomboon District        |LA_Sanasomboon District           |
// Champasack       |Paksxong District           |LA_Paksxong District              |
// Champasack       |Pathoomphone District       |LA_Pathoomphone District          |
// Champasack       |Moonlapamok District        |LA_Moonlapamok District           |
// Champasack       |Sukhuma District            |LA_Sukhuma District               |
// Champasack       |Khong District              |LA_Khong District                 |
// Champasack       |Bachiangchaleunsook District|LA_Bachiangchaleunsook District   |
// Houaphanh        |Sone District               |LA_Sone District                  |
// Houaphanh        |Huameuang District          |LA_Huameuang District             |
// Houaphanh        |Xamtay District             |LA_Xamtay District                |
// Houaphanh        |Kuane District              |LA_Kuane District                 |
// Houaphanh        |Huim District               |LA_Huim District                  |
// Houaphanh        |Et District                 |LA_Et District                    |
// Houaphanh        |Viengxay District           |LA_Viengxay District              |
// Houaphanh        |Xamneua District            |LA_Xamneua District               |
// Houaphanh        |Sopbao District             |LA_Sopbao District                |
// Houaphanh        |Xiengkhor District          |LA_Xiengkhor District             |
// Khammouane       |Khounkham District          |LA_Khounkham District             |
// Khammouane       |Bualapha District           |LA_Bualapha District              |
// Khammouane       |Nhommalath District         |LA_Nhommalath District            |
// Khammouane       |Hinboon District            |LA_Hinboon District               |
// Khammouane       |Mahaxay District            |LA_Mahaxay District               |
// Khammouane       |Nakai District              |LA_Nakai District                 |
// Khammouane       |Nongbok District            |LA_Nongbok District               |
// Khammouane       |Xebangfay District          |LA_Xebangfay District             |
// Khammouane       |Thakhek District            |LA_Thakhek District               |
// Khammouane       |Xaybuathong District        |LA_Xaybuathong District           |
// Luang Namtha     |Sing District               |LA_Sing District                  |
// Luang Namtha     |Long District               |LA_Long District                  |
// Luang Namtha     |Namtha District             |LA_Namtha District                |
// Luang Namtha     |Nalae District              |LA_Nalae District                 |
// Luang Namtha     |Viengphoukha District       |LA_Viengphoukha District          |
// Luangprabang     |Park ou District            |LA_Park ou District               |
// Luangprabang     |Chomphet District           |LA_Chomphet District              |
// Luangprabang     |Ngoi District               |LA_Ngoi District                  |
// Luangprabang     |Nan District                |LA_Nan District                   |
// Luangprabang     |Xieng Ngeun District        |LA_Xieng ngeun District           |
// Luangprabang     |Viengkham District          |LA_Viengkham District Luangprabang|
// Luangprabang     |Phonthong District          |LA_Phonthong District Luangprabang|
// Luangprabang     |Phonxay District            |LA_Phonxay District               |
// Luangprabang     |Phoukhoune District         |LA_Phoukhoune District            |
// Luangprabang     |Nambak District             |LA_Nambak District                |
// Luangprabang     |Pak xeng District           |LA_Pak xeng District              |
// Luangprabang     |Luangprabang District       |LA_Luangprabang District          |
// Oudomxay         |Xay District                |LA_Xay District                   |
// Oudomxay         |Nga District                |LA_Nga District                   |
// Oudomxay         |Pakbeng District            |LA_Pakbeng District               |
// Oudomxay         |Hoon District               |LA_Hoon District                  |
// Oudomxay         |La District                 |LA_La District                    |
// Oudomxay         |Beng District               |LA_Beng District                  |
// Oudomxay         |Namor District              |LA_Namor District                 |
// Phongsaly        |May District                |LA_May District                   |
// Phongsaly        |Nhot ou District            |LA_Nhot ou District               |
// Phongsaly        |Phongsaly District          |LA_Phongsaly District             |
// Phongsaly        |Samphanh District           |LA_Samphanh District              |
// Phongsaly        |Boontai District            |LA_Boontai District               |
// Phongsaly        |Boon neua District          |LA_Boon neua District             |
// Phongsaly        |Khua District               |LA_Khua District                  |
// Salavan          |Toomlarn District           |LA_Toomlarn District              |
// Salavan          |Samuoi District             |LA_Samuoi District                |
// Salavan          |Saravane District           |LA_Saravane District              |
// Salavan          |Khongxedone District        |LA_Khongxedone District           |
// Salavan          |Lakhonepheng District       |LA_Lakhonepheng District          |
// Salavan          |Vapy District               |LA_Vapy District                  |
// Salavan          |Ta oi District              |LA_Ta oi District                 |
// Salavan          |Lao ngarm District          |LA_Lao ngarm District             |
// Savannakhet      |Xonbuly District            |LA_Xonbuly District               |
// Savannakhet      |Champhone District          |LA_Champhone District             |
// Savannakhet      |Atsaphangthong District     |LA_Atsaphangthong District        |
// Savannakhet      |Xayphoothong District       |LA_Xayphoothong District          |
// Savannakhet      |Outhoomphone District       |LA_Outhoomphone District          |
// Savannakhet      |Thapangthong District       |LA_Thapangthong District          |
// Savannakhet      |Nong District               |LA_Nong District                  |
// Savannakhet      |Xaybuly District            |LA_Xaybuly District               |
// Savannakhet      |Atsaphone District          |LA_Atsaphone District             |
// Savannakhet      |Sepone District             |LA_Sepone District                |
// Savannakhet      |Vilabuly District           |LA_Vilabuly District              |
// Savannakhet      |Phalanxay District          |LA_Phalanxay District             |
// Savannakhet      |Phine District              |LA_Phine District                 |
// Savannakhet      |Songkhone District          |LA_Songkhone District             |
// Savannakhet      |KaysonePhomvihane District  |LA_KaysonePhomvihane District     |
// Sekong           |Dakcheung District          |LA_Dakcheung District             |
// Sekong           |Lamarm District             |LA_Lamarm District                |
// Sekong           |Thateng District            |LA_Thateng District               |
// Sekong           |Kaleum District             |LA_Kaleum District                |
// Vientiane        |Phonhong District           |LA_Phonhong District              |
// Vientiane        |Hinherb District            |LA_Hinherb District               |
// Vientiane        |Meun District               |LA_Meun District                  |
// Vientiane        |Thoulakhom District         |LA_Thoulakhom District            |
// Vientiane        |Kasy District               |LA_Kasy District                  |
// Vientiane        |Viengkham District          |LA_Viengkham District Vientiane   |
// Vientiane        |Xanakharm District          |LA_Xanakharm District             |
// Vientiane        |Vangvieng District          |LA_Vangvieng District             |
// Vientiane        |Mad District                |LA_Mad District                   |
// Vientiane        |Keo oudom District          |LA_Keo oudom District             |
// Vientiane        |Feuang District             |LA_Feuang District                |
// Vientiane capital|Sangthong District          |LA_Sangthong District             |
// Vientiane capital|Xaysetha District           |LA_Xaysetha District              |
// Vientiane capital|Sikhottabong District       |LA_Sikhottabong District          |
// Vientiane capital|Chanthabuly District        |LA_Chanthabuly District           |
// Vientiane capital|Naxaithong District         |LA_Naxaithong District            |
// Vientiane capital|Xaythany District           |LA_Xaythany District              |
// Vientiane capital|Sisattanak District         |LA_Sisattanak District            |
// Vientiane capital|Hadxaifong District         |LA_Hadxaifong District            |
// Vientiane capital|Mayparkngum District        |LA_Mayparkngum District           |
// Xaignabouly      |Thongmyxay District         |LA_Thongmyxay District            |
// Xaignabouly      |Phiang District             |LA_Phiang District                |
// Xaignabouly      |Kenethao District           |LA_Kenethao District              |
// Xaignabouly      |Xayabury District           |LA_Xayabury District              |
// Xaignabouly      |Ngeun District              |LA_Ngeun District                 |
// Xaignabouly      |Xienghone District          |LA_Xienghone District             |
// Xaignabouly      |Xaysathan District          |LA_Xaysathan District             |
// Xaignabouly      |Botene District             |LA_Botene District                |
// Xaignabouly      |Parklai District            |LA_Parklai District               |
// Xaignabouly      |Hongsa District             |LA_Hongsa District                |
// Xaignabouly      |Khop District               |LA_Khop District                  |
// Xaisomboun       |Anouvong District           |LA_Anouvong District              |
// Xaisomboun       |Thathom District            |LA_Thathom District               |
// Xaisomboun       |Home District               |LA_Home District                  |
// Xaisomboun       |Longsane District           |LA_Longsane District              |
// Xaisomboun       |Longcheng District          |LA_Longcheng District             |
// Xiangkhouang     |Nonghed District            |LA_Nonghed District               |
// Xiangkhouang     |Khoune District             |LA_Khoune District                |
// Xiangkhouang     |Morkmay District            |LA_Morkmay District               |
// Xiangkhouang     |Pek District                |LA_Pek District                   |
// Xiangkhouang     |Phaxay District             |LA_Phaxay District                |
// Xiangkhouang     |Phoukoud District           |LA_Phoukoud District              |
// Xiangkhouang     |Kham District               |LA_Kham District                  |

const dataServiceEntities = [
  { dhis_id: 'z1dTZFq99QZ', code: 'LA_Anouvong District' },
  { dhis_id: 'hDQauNuzydd', code: 'LA_Atsaphangthong District' },
  { dhis_id: 'IWIgHUHUYKC', code: 'LA_Atsaphone District' },
  { dhis_id: 'Hsr2Y6Jok4v', code: 'LA_Bachiangchaleunsook District' },
  { dhis_id: 'cCe4fMr3kcW', code: 'LA_Bolikhanh District' },
  { dhis_id: 'sq5uQNITnpC', code: 'LA_Botene District' },
  { dhis_id: 'ws9pcynqtUW', code: 'LA_Bualapha District' },
  { dhis_id: 'Bulg5xJ5zHq', code: 'LA_Boon neua District' },
  { dhis_id: 'j2o1vJ3GMVk', code: 'LA_Boontai District' },
  { dhis_id: 'U9BQd6CzEE7', code: 'LA_Champasack District' },
  { dhis_id: 'nur030iNgcT', code: 'LA_Champhone District' },
  { dhis_id: 'J41dVMJoZF7', code: 'LA_Chanthabuly District' },
  { dhis_id: 'ZfmjTPQe8j9', code: 'LA_Chomphet District' },
  { dhis_id: 'CcDxr2jKhw2', code: 'LA_Dakcheung District' },
  { dhis_id: 'IdFJN4KGKal', code: 'LA_Et District' },
  { dhis_id: 'W86PhQc09xZ', code: 'LA_Feuang District' },
  { dhis_id: 'iDVXhMLUhVl', code: 'LA_Hadxaifong District' },
  { dhis_id: 'CvkWQOq0D7q', code: 'LA_Huim District' },
  { dhis_id: 'bs3n4E4Rx22', code: 'LA_Hinboon District' },
  { dhis_id: 'x4SAJlppBgO', code: 'LA_Hinherb District' },
  { dhis_id: 'PTcRaqvWTYL', code: 'LA_Home District' },
  { dhis_id: 'wfphrbxVuSJ', code: 'LA_Hongsa District' },
  { dhis_id: 'dq93LdZo7PB', code: 'LA_Huameuang District' },
  { dhis_id: 'ZYyY8nmabmz', code: 'LA_Huoixai District' },
  { dhis_id: 'VY3ziHHgTq4', code: 'LA_Hoon District' },
  { dhis_id: 'HireFin5MM0', code: 'LA_Kaleum District' },
  { dhis_id: 'gGmcH7OMB06', code: 'LA_Kasy District' },
  { dhis_id: 'KVSQyYtvmIb', code: 'LA_KaysonePhomvihane District' },
  { dhis_id: 'nfiVnUxS5Lz', code: 'LA_Kenethao District' },
  { dhis_id: 'QqC81g41Yo9', code: 'LA_Keo oudom District' },
  { dhis_id: 'bIGWAiJ7CLC', code: 'LA_Kham District' },
  { dhis_id: 'CdZaIdpMHlK', code: 'LA_Khamkeuth District' },
  { dhis_id: 'xiUrduoyzq4', code: 'LA_Khong District' },
  { dhis_id: 'Udurj4PSmfg', code: 'LA_Khongxedone District' },
  { dhis_id: 'Me946R8iIPF', code: 'LA_Khop District' },
  { dhis_id: 'AEpA89o11l6', code: 'LA_Khua District' },
  { dhis_id: 'iLz862KQ92y', code: 'LA_Khoune District' },
  { dhis_id: 'qwkMZL3UsnI', code: 'LA_Khounkham District' },
  { dhis_id: 'l3Lcy6a8hNq', code: 'LA_Kuane District' },
  { dhis_id: 'dZ5oSjN9JWm', code: 'LA_La District' },
  { dhis_id: 'd33R59H8hub', code: 'LA_Lakhonepheng District' },
  { dhis_id: 'A4DI8bkHoT1', code: 'LA_Lamarm District' },
  { dhis_id: 'QxrnkSqtpeL', code: 'LA_Lao ngarm District' },
  { dhis_id: 'Fal5UUEyVaX', code: 'LA_Long District' },
  { dhis_id: 'HlByKuY86TG', code: 'LA_Longcheng District' },
  { dhis_id: 'PFuHbg40svw', code: 'LA_Longsane District' },
  { dhis_id: 'Q5JAes2XaXh', code: 'LA_Luangprabang District' },
  { dhis_id: 'r7kBscYDzVf', code: 'LA_Mahaxay District' },
  { dhis_id: 'gUANJUwKAMM', code: 'LA_May District' },
  { dhis_id: 'er7zil8w1dY', code: 'LA_Mad District' },
  { dhis_id: 'ofKhxvVUALX', code: 'LA_Meung District' },
  { dhis_id: 'W3v15YSqwVW', code: 'LA_Morkmay District' },
  { dhis_id: 'E7En0U9fwUM', code: 'LA_Moonlapamok District' },
  { dhis_id: 'R0lXmpeWpya', code: 'LA_Meun District' },
  { dhis_id: 'NEJ1E1GCWvl', code: 'LA_Nakai District' },
  { dhis_id: 'VY3iCvX7HJB', code: 'LA_Nalae District' },
  { dhis_id: 'CpHpwrv5IzH', code: 'LA_Nambak District' },
  { dhis_id: 'wqc47M6410Q', code: 'LA_Namor District' },
  { dhis_id: 'jcDjmPQUCGt', code: 'LA_Namtha District' },
  { dhis_id: 'rISL8MSdJRR', code: 'LA_Nan District' },
  { dhis_id: 'C9ncRif5rMV', code: 'LA_Naxaithong District' },
  { dhis_id: 'yfaXQY7LfOb', code: 'LA_Nga District' },
  { dhis_id: 'BW2FLo9CfKf', code: 'LA_Ngeun District' },
  { dhis_id: 'J2SVWwYmmaW', code: 'LA_Ngoi District' },
  { dhis_id: 'MOQlhAJ6AlY', code: 'LA_Nong District' },
  { dhis_id: 'sAdLtdvg6uW', code: 'LA_Nongbok District' },
  { dhis_id: 'SQ4GZD2pg2P', code: 'LA_Nonghed District' },
  { dhis_id: 'gTcU2wRKnzg', code: 'LA_Nhommalath District' },
  { dhis_id: 'MYSLu2kvMOZ', code: 'LA_Nhot ou District' },
  { dhis_id: 'Y03EDczSD2S', code: 'LA_Outhoomphone District' },
  { dhis_id: 'v3HIu78Y4Wf', code: 'LA_Mayparkngum District' },
  { dhis_id: 'tKbjZkcuuEM', code: 'LA_Pakbeng District' },
  { dhis_id: 'B6gy0OXwmdE', code: 'LA_Pakkading District' },
  { dhis_id: 'bVJP2gr2dZw', code: 'LA_Parklai District' },
  { dhis_id: 'ZIpafUoPBsZ', code: 'LA_Park ou District' },
  { dhis_id: 'lZSTiL43bJ1', code: 'LA_Paktha District' },
  { dhis_id: 'Skb3RGA4qqD', code: 'LA_Pakxane District' },
  { dhis_id: 'bsMamKcV49M', code: 'LA_Pakse District' },
  { dhis_id: 'Xcg5RylNj85', code: 'LA_Pak xeng District' },
  { dhis_id: 'O8DPwm0imCZ', code: 'LA_Paksxong District' },
  { dhis_id: 'oEbpxKDpSas', code: 'LA_Pathoomphone District' },
  { dhis_id: 'jUi4dInpZ9f', code: 'LA_Pek District' },
  { dhis_id: 'Yb6P0MkwYIb', code: 'LA_Phalanxay District' },
  { dhis_id: 'JkDRFRhTl7C', code: 'LA_Pha oudom District' },
  { dhis_id: 'XFpTQ7vkeg9', code: 'LA_Phaxay District' },
  { dhis_id: 'PwAzF2To8mO', code: 'LA_Phiang District' },
  { dhis_id: 'WqgebFq82ww', code: 'LA_Phine District' },
  { dhis_id: 'QSLJYVqiFdG', code: 'LA_Phonhong District' },
  { dhis_id: 'a6vyKuz7whz', code: 'LA_Phonthong District Luangprabang' },
  { dhis_id: 'Mv4GybTVICB', code: 'LA_Phonthong District Champasack' },
  { dhis_id: 'vzuq3IXD0RQ', code: 'LA_Phonxay District' },
  { dhis_id: 'WIHYB04cTmj', code: 'LA_Phoukhoune District' },
  { dhis_id: 'E8DNWkaHoeC', code: 'LA_Phoukoud District' },
  { dhis_id: 'Fz97ETPEdrG', code: 'LA_Phouvong District' },
  { dhis_id: 'QYcSJVsJGjz', code: 'LA_Saravane District' },
  { dhis_id: 'TK1lMbN5O9x', code: 'LA_Samakkhixay District' },
  { dhis_id: 'f3sawzO78L2', code: 'LA_Samuoi District' },
  { dhis_id: 'K8L5uHmjqB7', code: 'LA_Samphanh District' },
  { dhis_id: 'nhSsVL3Xmxy', code: 'LA_Sanamxay District' },
  { dhis_id: 'y7jFepm7IF6', code: 'LA_Sangthong District' },
  { dhis_id: 'exb7tb9Epwo', code: 'LA_Sanxay District' },
  { dhis_id: 'VvDJca31fkJ', code: 'LA_Sikhottabong District' },
  { dhis_id: 'WFV8JKYbErh', code: 'LA_Sing District' },
  { dhis_id: 'utPJtI4qYl7', code: 'LA_Sisattanak District' },
  { dhis_id: 'QB3tdBsh8CJ', code: 'LA_Songkhone District' },
  { dhis_id: 'tmpylkjuRHV', code: 'LA_Sopbao District' },
  { dhis_id: 'ALxACxbOkfe', code: 'LA_Sukhuma District' },
  { dhis_id: 'djhtLGN3IvA', code: 'LA_Ta oi District' },
  { dhis_id: 'VcsTj0wAMz3', code: 'LA_Thakhek District' },
  { dhis_id: 'L0FASKXq16I', code: 'LA_Thapangthong District' },
  { dhis_id: 'dZ80ShVOW0Q', code: 'LA_Thaphabath District' },
  { dhis_id: 'X6b34IMhO6e', code: 'LA_Thateng District' },
  { dhis_id: 'EjueUraWGRt', code: 'LA_Thathom District' },
  { dhis_id: 'VUg2VEUHTpT', code: 'LA_Thongmyxay District' },
  { dhis_id: 'EwPKqBLXlHp', code: 'LA_Thoulakhom District' },
  { dhis_id: 'J5rWoIGkgWA', code: 'LA_Tonpheung District' },
  { dhis_id: 'atgNS67uGoe', code: 'LA_Toomlarn District' },
  { dhis_id: 'uaQZnfcewkO', code: 'LA_Vangvieng District' },
  { dhis_id: 'AVaQXI9hiqz', code: 'LA_Vapy District' },
  { dhis_id: 'NqbL4gp4Xm6', code: 'LA_Viengkham District Luangprabang' },
  { dhis_id: 'qnUmPgh81wj', code: 'LA_Viengkham District Vientiane' },
  { dhis_id: 'UuXdGgnqm5l', code: 'LA_Viengphoukha District' },
  { dhis_id: 'lr6QkB7KhJr', code: 'LA_Viengthong District' },
  { dhis_id: 'h9P7GW6AFHx', code: 'LA_Viengxay District' },
  { dhis_id: 'PaI7LvjRjbv', code: 'LA_Vilabuly District' },
  { dhis_id: 'NUnVKR3k7G9', code: 'LA_Xay District' },
  { dhis_id: 'aAYY2xtUPpd', code: 'LA_Xaybuathong District' },
  { dhis_id: 'JoI6G8WKb72', code: 'LA_Xaybuly District' },
  { dhis_id: 'aszist0a6Jz', code: 'LA_Xaychamphone District' },
  { dhis_id: 'Dwq91yyxURZ', code: 'LA_Xayabury District' },
  { dhis_id: 'J7DiTM2VZra', code: 'LA_Xayphoothong District' },
  { dhis_id: 'xh6DUwZnbjX', code: 'LA_Xaysathan District' },
  { dhis_id: 'l6UBKFBkEYt', code: 'LA_Saysetha District' },
  { dhis_id: 'wQkVGahF58I', code: 'LA_Xaysetha District' },
  { dhis_id: 'xxBxJFWXtrL', code: 'LA_Xaythany District' },
  { dhis_id: 'GAQDy0r51MG', code: 'LA_Xamneua District' },
  { dhis_id: 'Ds0J5ySnPHj', code: 'LA_Xamtay District' },
  { dhis_id: 'Vl2jDwzt80t', code: 'LA_Xanakharm District' },
  { dhis_id: 'RamRkmQJ5bW', code: 'LA_Sanasomboon District' },
  { dhis_id: 'Rh6KgbBNOpE', code: 'LA_Xebangfay District' },
  { dhis_id: 'Jb1CzfozK8L', code: 'LA_Sepone District' },
  { dhis_id: 'H8tXTAO4pGO', code: 'LA_Xienghone District' },
  { dhis_id: 'xEfcZVYIjzv', code: 'LA_Xiengkhor District' },
  { dhis_id: 'CBDW21YlLnB', code: 'LA_Xieng ngeun District' },
  { dhis_id: 'X8kOf41v0rx', code: 'LA_Sone District' },
  { dhis_id: 'hc9BFIWxmCY', code: 'LA_Xonbuly District' },
  { dhis_id: 'cKqBHq6eOea', code: 'LA_Beng District' },
  { dhis_id: 'XdubcbI8tyT', code: 'LA_Phongsaly District' },
];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  return Promise.all(
    dataServiceEntities.map(dataServiceEntity =>
      insertObject(db, 'data_service_entity', {
        id: generateId(),
        entity_code: dataServiceEntity.code,
        config: { dhis_id: dataServiceEntity.dhis_id },
      }),
    ),
  );
};

exports.down = function (db) {
  return db.runSql(`
  delete from "data_service_entity" where "entity_code" in (${arrayToDbString(
    dataServiceEntities.map(ds => ds.code),
  )});
`);
};

exports._meta = {
  version: 1,
};
