// app/resultados.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";

/* ------------------- DADOS DE EXEMPLO ------------------- */
const CANDIDATOS = [
  {
    id: "c1",
    nome: "João Manuel Gonçalves Lourenço",
    partido: "Movimento Popular de Libertação de Angola",
    sigla: "MPLA",
    partidoColor: "#FF0000",
    votos: 1250,
    foto: "https://i.pravatar.cc/150?img=12",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/7b/MPLA_logo.png",
  },
  {
    id: "c2",
    nome: "Adalberto da Costa Júnior",
    partido: "União Nacional para a Independência Total de Angola",
    sigla: "UNITA",
    partidoColor: "#008000",
    votos: 24000,
    foto: "https://i.pravatar.cc/150?img=47",
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/1b/UNITA_logo.png",
  },
  {
    id: "c3",
    nome: "Lucas Ngonda",
    partido: "Frente Nacional de Libertação de Angola",
    sigla: "FNLA",
    partidoColor: "#0000FF",
    votos: 900000,
    foto: "https://i.pravatar.cc/150?img=5",
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/c7/FNLA_logo.png",
  },
  {
    id: "c4",
    nome: "Abel Chivukuvuku",
    partido: "Pra Já Servir Angola",
    sigla: "PRA-JÁ",
    partidoColor: "#800080",
    votos: 0,
    foto: "https://i.pravatar.cc/150?img=30",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/3f/FRENTE_logo.png",
  },
];

/* ------------------- FUNÇÃO FORMATAR NÚMEROS ------------------- */
const formatarVotos = (num: number) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

export default function Resultados() {
  const [candidatos, setCandidatos] = useState(CANDIDATOS);
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [votacaoEncerrada, setVotacaoEncerrada] = useState(false);

  const totalVotos = useMemo(
    () => candidatos.reduce((acc, c) => acc + (c.votos || 0), 0),
    [candidatos]
  );

  // Identifica o vencedor
  const vencedor = useMemo(() => {
    return candidatos.reduce(
      (prev, curr) => (curr.votos > prev.votos ? curr : prev),
      candidatos[0]
    );
  }, [candidatos]);

  useEffect(() => {
    const fimVotacao = new Date();
    fimVotacao.setMinutes(fimVotacao.getMinutes() + 1); // tempo de teste

    const interval = setInterval(() => {
      const now = new Date();
      const diff = fimVotacao.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
        setVotacaoEncerrada(true);
      } else {
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutos = Math.floor((diff / (1000 * 60)) % 60);
        const segundos = Math.floor((diff / 1000) % 60);
        setTimeLeft({ dias, horas, minutos, segundos });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (votacaoEncerrada) {
    // Tela de vencedor com bandeira de Angola
    return (
      <SafeAreaView style={styles.winnerPage}>
        <Text style={styles.winnerTitle}>Eleição Encerrada</Text>
        <Text style={styles.winnerSubtitle}>Vencedor da Eleição</Text>

        <Image
          source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Angola.svg" }}
          style={styles.flag}
          resizeMode="contain"
        />

        <View style={styles.winnerCard}>
          <Image source={{ uri: vencedor.foto }} style={styles.winnerAvatar} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.winnerName}>{vencedor.nome}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
              <Image source={{ uri: vencedor.icon }} style={styles.icon} />
              <Text style={styles.winnerPartido}>{vencedor.partido}</Text>
            </View>
            <Text style={styles.governacao}>Mandato: 2025 - 2030</Text>
            <Text style={styles.votosFinal}>
              Votos: {formatarVotos(vencedor.votos)} ({Math.round((vencedor.votos / totalVotos) * 100)}%)
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderCandidato = (item: typeof CANDIDATOS[0]) => {
    const percent = totalVotos > 0 ? Math.round((item.votos / totalVotos) * 100) : 0;
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.foto }} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.partido}>{item.partido}</Text>
          <View style={styles.progressWrap}>
            <View
              style={[styles.progress, { width: `${percent}%`, backgroundColor: item.partidoColor }]}
            />
            <Text style={styles.percentText}>{percent}%</Text>
          </View>
        </View>
        <Text style={styles.votosText}>{formatarVotos(item.votos)} votos</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.title}>Resultados da Eleição</Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {timeLeft.dias}d : {timeLeft.horas}h : {timeLeft.minutos}m : {timeLeft.segundos}s restantes
        </Text>
      </View>

      <Text style={styles.subtitle}>Total de votos: {formatarVotos(totalVotos)}</Text>

      <FlatList
        data={candidatos}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => renderCandidato(item)}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F7F8", paddingTop: Platform.OS === "android" ? 24 : 0 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginTop: 20, marginBottom: 4, color: "#111" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#666", marginBottom: 12 },
  timerContainer: { backgroundColor: "#000", paddingVertical: 10, marginHorizontal: 20, borderRadius: 8, marginBottom: 12 },
  timerText: { textAlign: "center", color: "#FFD700", fontWeight: "700", fontSize: 16 },

  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 3 },
  avatar: { width: 64, height: 64, borderRadius: 12 },
  nome: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 2 },
  partido: { fontSize: 13, color: "#444", marginBottom: 6 },
  progressWrap: { height: 12, backgroundColor: "#eee", borderRadius: 8, overflow: "hidden", position: "relative" },
  progress: { height: "100%" },
  percentText: { position: "absolute", right: 8, top: -18, fontSize: 12, color: "#444", fontWeight: "600" },
  votosText: { fontSize: 14, fontWeight: "700", color: "#111" },

  // Tela vencedor
  winnerPage: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F0F4F8", padding: 20 },
  winnerTitle: { fontSize: 26, fontWeight: "800", color: "#111", marginBottom: 4 },
  winnerSubtitle: { fontSize: 16, fontWeight: "600", color: "#666", marginBottom: 16 },
  winnerCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 5 },
  winnerAvatar: { width: 100, height: 100, borderRadius: 16 },
  icon: { width: 28, height: 28, marginRight: 8 },
  winnerName: { fontSize: 20, fontWeight: "700", color: "#111" },
  winnerPartido: { fontSize: 16, fontWeight: "600", color: "#444" },
  governacao: { fontSize: 14, color: "#666", marginTop: 4 },
  votosFinal: { fontSize: 16, fontWeight: "700", marginTop: 6, color: "#111" },
  flag: { width: 120, height: 80, marginBottom: 16 },
});
