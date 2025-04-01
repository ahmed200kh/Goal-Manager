import { useState, useEffect } from "react"; // React hook'larını kullanıyoruz.
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Lokal veri saklama için.
import Icon from "react-native-vector-icons/MaterialIcons"; // Material ikonları için.

export default function App() {
  // Durum (state) tanımlamaları:
  // enteredGoal: Girilen hedef metni.
  // goals: Tüm hedeflerin listesi.
  // editingGoalId: Düzenlenmekte olan hedefin benzersiz ID'si.
  const [enteredGoal, setEnteredGoal] = useState("");
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);

  // Uygulama başladığında AsyncStorage'dan verileri yükler.
  useEffect(() => {
    async function loadGoals() {
      try {
        const storedGoals = await AsyncStorage.getItem("goals");
        if (storedGoals) setGoals(JSON.parse(storedGoals));
      } catch (error) {
        Alert.alert("Error Loading Goals", error.message || "Unknown error");
      }
    }
    loadGoals();
  }, []);

  // Güncellenmiş hedef listesini AsyncStorage'a kaydeder.
  async function saveGoals(updatedGoals) {
    try {
      await AsyncStorage.setItem("goals", JSON.stringify(updatedGoals));
    } catch (error) {
      Alert.alert("Error Saving Goals", error.message || "Unknown error");
    }
  }

  // TextInput'tan gelen değeri state'e aktarır.
  function goalInputHandler(enteredText) {
    setEnteredGoal(enteredText);
  }

  // Yeni hedef ekler veya düzenleme modundaki hedefi günceller.
  function addOrUpdateGoalHandler() {
    if (enteredGoal.trim().length === 0) return; // Boş metin girilirse işlem yapmaz.

    if (editingGoalId) {
      // Düzenleme modunda, ilgili hedefin metnini günceller.
      const updatedGoals = goals.map((goal) =>
        goal.id === editingGoalId ? { ...goal, text: enteredGoal } : goal
      );
      setGoals(updatedGoals);
      saveGoals(updatedGoals);
      setEditingGoalId(null); // Düzenleme modundan çık.
    } else {
      // Yeni hedef oluşturur ve listeye ekler.
      const newGoal = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Benzersiz ID oluşturur.
        text: enteredGoal,
        completed: false,
      };
      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);
      saveGoals(updatedGoals);
    }
    setEnteredGoal(""); // İşlem sonrasında TextInput'u temizler.
  }

  // Hedef silme işlemi: Kullanıcı onayı alındıktan sonra hedefi siler.
  function deleteGoalHandler(goalId) {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          const updatedGoals = goals.filter((goal) => goal.id !== goalId);
          setGoals(updatedGoals);
          saveGoals(updatedGoals);
        },
      },
    ]);
  }

  // Hedefin tamamlanma durumunu tersine çevirir.
  function toggleCompleteHandler(goalId) {
    const updatedGoals = goals.map((goal) =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    );
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  }

  // Düzenleme moduna geçer; seçilen hedefin metnini TextInput'a getirir.
  function editGoalHandler(goalId) {
    const goalToEdit = goals.find((goal) => goal.id === goalId);
    if (goalToEdit) {
      setEnteredGoal(goalToEdit.text);
      setEditingGoalId(goalId);
    }
  }

  return (
    <View style={styles.appContainer}>
      {/* Giriş alanı ve ekleme/düzenleme butonu */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your goal"
          onChangeText={goalInputHandler}
          value={enteredGoal}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          onPress={addOrUpdateGoalHandler}
          style={styles.addButton}
        >
          <Icon
            name={editingGoalId ? "check-circle" : "add-circle"}
            size={40}
            color="#2ecc71"
          />
        </TouchableOpacity>
      </View>

      {/* Hedef listesinin gösterimi */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>List of Goals</Text>
        <FlatList
          data={goals}
          renderItem={({ item }) => (
            <View style={styles.goalItem}>
              {/* Hedef metni */}
              <View style={styles.goalTextContainer}>
                <TouchableOpacity onPress={() => toggleCompleteHandler(item.id)}>
                  <Text
                    style={[
                      styles.goalText,
                      item.completed && styles.completedText,
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Düzenleme ve silme ikonları */}
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  onPress={() => editGoalHandler(item.id)}
                  style={styles.iconButton}
                >
                  <Icon name="edit" size={24} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteGoalHandler(item.id)}
                  style={styles.iconButton}
                >
                  <Icon name="delete" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}

// Stil ayarları
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#ecf0f1", // Açık gri-mavi arka plan.
    paddingTop: 50,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    color: "#2c3e50",
    padding: 10,
    backgroundColor: "#ecf0f1",
    minHeight: 60,
    maxHeight: 120,
  },
  addButton: {
    marginLeft: 10,
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  goalItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  goalTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  goalText: {
    fontSize: 16,
    color: "#34495e",
    flexWrap: "wrap",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#95a5a6",
  },
  iconContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
  },
  iconButton: {
    marginHorizontal: 5,
  },
});
